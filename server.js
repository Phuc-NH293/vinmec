/**
 * Vinmec Local Development Server
 * Zero-dependency static server that reads .env files and serves configuration endpoints.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

// Helper to load and parse .env manually (no dependencies needed!)
function loadEnv() {
    const envPath = path.join(__dirname, '.env');
    const env = {
        ANTCO_API_KEY: '',
        ANTCO_API_URL: 'https://ai-gateway.antco.ai/v1/chat/completions',
        ANTCO_API_MODEL: 'gpt-4o-mini'
    };
    
    if (fs.existsSync(envPath)) {
        try {
            const content = fs.readFileSync(envPath, 'utf8');
            content.split(/\r?\n/).forEach(line => {
                const trimmed = line.trim();
                // Ignore empty lines and comments
                if (trimmed && !trimmed.startsWith('#')) {
                    const separatorIndex = trimmed.indexOf('=');
                    if (separatorIndex !== -1) {
                        const key = trimmed.substring(0, separatorIndex).trim();
                        let val = trimmed.substring(separatorIndex + 1).trim();
                        // Strip wrapping quotes
                        val = val.replace(/^['"]|['"]$/g, '');
                        env[key] = val;
                    }
                }
            });
            console.log('📝 Đã tải biến môi trường thành công từ tệp .env');
        } catch (err) {
            console.error('❌ Lỗi đọc tệp .env:', err);
        }
    } else {
        console.warn('⚠️ Không tìm thấy tệp .env. Sẽ dùng cấu hình mặc định.');
    }
    return env;
}

const envVariables = loadEnv();

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    // API endpoint to serve config to client script
    if (req.url === '/api/config') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            apiKey: envVariables.ANTCO_API_KEY,
            apiUrl: envVariables.ANTCO_API_URL,
            apiModel: envVariables.ANTCO_API_MODEL
        }));
        return;
    }

    // Static files serving logic
    let filePath = req.url === '/' ? '/index.html' : req.url;
    // Strip query parameters
    const queryIndex = filePath.indexOf('?');
    if (queryIndex !== -1) {
        filePath = filePath.substring(0, queryIndex);
    }
    
    const fullPath = path.join(__dirname, filePath);
    const ext = path.extname(fullPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(fullPath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('404: Không tìm thấy tệp tin.');
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('500: Lỗi máy chủ.');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

server.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 Máy chủ đang chạy tại: http://localhost:${PORT}`);
    console.log(`======================================================\n`);
});
