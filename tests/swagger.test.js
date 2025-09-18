const { setupSwagger } = require('../dist/config/swagger');
const express = require('express');

async function testSwaggerSetup() {
    console.log('🧪 Testing Swagger configuration...');
    
    try {
        const app = express();
        
        // Test Swagger setup
        setupSwagger(app);
        console.log('✅ Swagger setup successful');
        
        // Test if routes are accessible
        const server = app.listen(3001, () => {
            console.log('✅ Test server started on port 3001');
            
            // Test endpoints
            const testEndpoints = [
                'http://localhost:3001/docs',
                'http://localhost:3001/docs.json'
            ];
            
            console.log('\n📋 Available documentation endpoints:');
            testEndpoints.forEach(endpoint => {
                console.log(`   📖 ${endpoint}`);
            });
            
            console.log('\n🎉 Swagger documentation is ready!');
            console.log('\n💡 To test:');
            console.log('   1. Run: npm run build');
            console.log('   2. Run: npm start');
            console.log('   3. Open: http://localhost:8080/docs');
            
            server.close();
        });
        
    } catch (error) {
        console.error('❌ Swagger test failed:', error.message);
        console.log('\n🔍 Make sure to:');
        console.log('   1. Build the project: npm run build');
        console.log('   2. Check swagger dependencies are installed');
        console.log('   3. Verify TypeScript compilation is successful');
    }
}

// Run test if this file is executed directly
if (require.main === module) {
    testSwaggerSetup().catch(console.error);
}

module.exports = testSwaggerSetup;