const request = require('supertest');
const app = require('../server');
const path = require('path');
const fs = require('fs');

describe('API Tests', () => {
    let authToken;

    // Test authentication
    describe('Authentication', () => {
        test('Should login with admin credentials', async () => {
            const res = await request(app)
                .post('/api/login')
                .send({
                    username: 'admin',
                    password: 'wildcats2025'
                });
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('token');
            expect(res.body).toHaveProperty('role', 'admin');
            authToken = res.body.token;
        });

        test('Should reject invalid credentials', async () => {
            const res = await request(app)
                .post('/api/login')
                .send({
                    username: 'wrong',
                    password: 'wrong'
                });
            expect(res.statusCode).toBe(401);
        });
    });

    // Test submissions
    describe('Submissions', () => {
        test('Should create new submission', async () => {
            const submission = {
                name: 'Test User',
                email: 'test@example.com',
                service: 'Snow Removal',
                message: 'Test message'
            };

            const res = await request(app)
                .post('/api/submissions')
                .send(submission);
            expect(res.statusCode).toBe(200);
        });

        test('Should get submissions with valid token', async () => {
            const res = await request(app)
                .get('/api/submissions')
                .set('Authorization', `Bearer ${authToken}`);
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBeTruthy();
        });
    });

    // Test content management
    describe('Content Management', () => {
        test('Should update content with valid token', async () => {
            const content = {
                location: 'hero',
                type: 'text',
                content: 'Test content'
            };

            const res = await request(app)
                .post('/api/content')
                .set('Authorization', `Bearer ${authToken}`)
                .send(content);
            expect(res.statusCode).toBe(200);
        });

        test('Should get content', async () => {
            const res = await request(app)
                .get('/api/content');
            expect(res.statusCode).toBe(200);
            expect(typeof res.body).toBe('object');
        });
    });

    // Test file uploads
    describe('File Uploads', () => {
        test('Should upload file with valid token', async () => {
            const testFilePath = path.join(__dirname, 'test_image.png');
            // Create a test image file
            fs.writeFileSync(testFilePath, 'test image content');

            const res = await request(app)
                .post('/api/upload')
                .set('Authorization', `Bearer ${authToken}`)
                .attach('image', testFilePath);
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('filepath');

            // Cleanup
            fs.unlinkSync(testFilePath);
        });
    });
});