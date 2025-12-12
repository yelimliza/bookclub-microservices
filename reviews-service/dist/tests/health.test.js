"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require('supertest');
const testing_1 = require("@nestjs/testing");
const app_module_1 = require("../src/app.module");
describe('Health Check', () => {
    let app;
    beforeAll(async () => {
        const moduleRef = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
        app = moduleRef.createNestApplication();
        await app.init();
    });
    afterAll(async () => {
        await app.close();
    });
    it('should respond with 200 on /health', async () => {
        const res = await request(app.getHttpServer()).get('/health');
        expect(res.status).toBe(200);
    });
});
//# sourceMappingURL=health.test.js.map