import fs from 'fs';
import path from 'path';
import { HttpsProxyAgent } from 'https-proxy-agent';
import axios, { AxiosRequestConfig } from 'axios';

const PROXY_FILE_PATH = path.join(process.cwd(), 'proxy.txt');

interface ProxyConfig {
    host: string;
    port: string;
    username: string;
    password: string;
}

export class ProxyManager {
    private static parseProxy(proxyString: string): ProxyConfig | null {
        const parts = proxyString.trim().split(':');
        if (parts.length !== 4) return null;

        return {
            host: parts[0],
            port: parts[1],
            username: parts[2],
            password: parts[3]
        };
    }

    private static createProxyAgent(config: ProxyConfig): HttpsProxyAgent<string> {
        const proxyUrl = `http://${config.username}:${config.password}@${config.host}:${config.port}`;
        return new HttpsProxyAgent(proxyUrl);
    }

    private static readProxies(): string[] {
        if (!fs.existsSync(PROXY_FILE_PATH)) {
            console.warn('Proxy file not found:', PROXY_FILE_PATH);
            return [];
        }
        const content = fs.readFileSync(PROXY_FILE_PATH, 'utf-8');
        return content.split('\n').filter(line => line.trim() !== '');
    }

    private static writeProxies(lines: string[]): void {
        fs.writeFileSync(PROXY_FILE_PATH, lines.join('\n'));
    }

    private static removeProxy(badProxy: ProxyConfig) {
        const lines = this.readProxies();
        const newLines = lines.filter(line => {
            const conf = this.parseProxy(line);
            if (!conf) return false;
            return !(
                conf.host === badProxy.host &&
                conf.port === badProxy.port &&
                conf.username === badProxy.username &&
                conf.password === badProxy.password
            );
        });
        this.writeProxies(newLines);
    }

    /**
     * Coba request pakai proxy dari file.
     * Kalau gagal, hapus proxy & coba lagi dengan proxy berikutnya.
     */
    public static async makeRequestWithProxy(url: string, options: AxiosRequestConfig = {}): Promise<any> {
        let proxies = this.readProxies();

        while (proxies.length > 0) {
            const proxyConfig = this.parseProxy(proxies[0]);
            if (!proxyConfig) {
                // format salah → hapus langsung
                proxies.shift();
                this.writeProxies(proxies);
                continue;
            }

            const proxyAgent = this.createProxyAgent(proxyConfig);

            const axiosConfig: AxiosRequestConfig = {
                ...options,
                timeout: 30000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
                    ...options.headers
                },
                httpAgent: proxyAgent,
                httpsAgent: proxyAgent,
            };

            try {
                const res = await axios.get(url, axiosConfig);

                console.log(`✅ Proxy OK: ${proxyConfig.host}:${proxyConfig.port}`);
                return res; // proxy tetap dipakai, tidak dihapus
            } catch (err) {
                console.warn(`❌ Proxy gagal: ${proxyConfig.host}:${proxyConfig.port}, dihapus dari list`);
                // hapus proxy gagal dari file
                this.removeProxy(proxyConfig);
                proxies = this.readProxies(); // refresh daftar proxy
            }
        }

        throw new Error('Tidak ada proxy yang bisa digunakan');
    }
}
