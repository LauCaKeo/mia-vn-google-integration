const fs = require('fs');
const path = require('path');

console.log('🔍 Phân tích Bundle Size...\n');

// Đường dẫn tới thư mục build
const buildDir = path.join(__dirname, '..', 'dist');

if (!fs.existsSync(buildDir)) {
    console.log('❌ Thư mục dist không tồn tại. Vui lòng chạy "npm run build" trước.');
    process.exit(1);
}

// Hàm format kích thước
function formatSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Hàm phân tích thư mục
function analyzeDirectory(dir) {
    const files = [];

    function traverse(currentDir, relativePath = '') {
        const items = fs.readdirSync(currentDir);

        for (const item of items) {
            const itemPath = path.join(currentDir, item);
            const relativeItemPath = path.join(relativePath, item);
            const stats = fs.statSync(itemPath);

            if (stats.isDirectory()) {
                traverse(itemPath, relativeItemPath);
            } else {
                const size = stats.size;
                const ext = path.extname(item).toLowerCase();

                files.push({
                    name: item,
                    path: relativeItemPath,
                    size: size,
                    ext: ext,
                    type: getFileType(ext, item)
                });
            }
        }
    }

    traverse(dir);
    return files;
}

// Hàm xác định loại file
function getFileType(ext, filename) {
    if (ext === '.js') {
        if (filename.includes('.map')) return 'MAP';
        if (filename === 'sw.js') return 'SERVICE_WORKER';
        if (filename.startsWith('chunk.') || filename.includes('-') && !filename.includes('index')) {
            return 'CHUNK';
        }
        return 'JS';
    }
    if (ext === '.css') return 'CSS';
    if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.avif'].includes(ext)) return 'IMAGE';
    if (['.woff', '.woff2', '.ttf', '.eot', '.otf'].includes(ext)) return 'FONT';
    if (ext === '.html') return 'HTML';
    return 'OTHER';
}

// Phân tích files
const allFiles = analyzeDirectory(buildDir);

// Tính toán thống kê
const stats = {
    totalSize: 0,
    js: { files: [], size: 0 },
    css: { files: [], size: 0 },
    images: { files: [], size: 0 },
    other: { files: [], size: 0 }
};

allFiles.forEach(file => {
    stats.totalSize += file.size;

    switch (file.type) {
        case 'JS':
        case 'CHUNK':
        case 'SERVICE_WORKER':
            stats.js.files.push(file);
            stats.js.size += file.size;
            break;
        case 'CSS':
            stats.css.files.push(file);
            stats.css.size += file.size;
            break;
        case 'IMAGE':
            stats.images.files.push(file);
            stats.images.size += file.size;
            break;
        default:
            stats.other.files.push(file);
            stats.other.size += file.size;
    }
});

// Sắp xếp files theo kích thước
stats.js.files.sort((a, b) => b.size - a.size);
stats.css.files.sort((a, b) => b.size - a.size);
stats.images.files.sort((a, b) => b.size - a.size);
stats.other.files.sort((a, b) => b.size - a.size);

// Hiển thị thống kê
console.log('📊 THỐNG KÊ BUNDLE SIZE');
console.log('==================================================');
console.log(`📦 Tổng kích thước: ${formatSize(stats.totalSize)}\n`);

// Hiển thị JS Files
if (stats.js.files.length > 0) {
    const percentage = ((stats.js.size / stats.totalSize) * 100).toFixed(1);
    console.log(`JS Files: ${formatSize(stats.js.size)} (${percentage}%)`);
    stats.js.files.slice(0, 5).forEach(file => {
        console.log(`   ├── ${file.path}: ${formatSize(file.size)}`);
    });
    console.log('');
}

// Hiển thị CSS Files
if (stats.css.files.length > 0) {
    const percentage = ((stats.css.size / stats.totalSize) * 100).toFixed(1);
    console.log(`CSS Files: ${formatSize(stats.css.size)} (${percentage}%)`);
    stats.css.files.slice(0, 5).forEach(file => {
        console.log(`   ├── ${file.path}: ${formatSize(file.size)}`);
    });
    console.log('');
}

// Hiển thị Images
if (stats.images.files.length > 0) {
    const percentage = ((stats.images.size / stats.totalSize) * 100).toFixed(1);
    console.log(`IMAGES Files: ${formatSize(stats.images.size)} (${percentage}%)`);
    stats.images.files.slice(0, 5).forEach(file => {
        console.log(`   ├── ${file.name}: ${formatSize(file.size)}`);
    });
    console.log('');
}

// Hiển thị Other Files
if (stats.other.files.length > 0) {
    const percentage = ((stats.other.size / stats.totalSize) * 100).toFixed(1);
    console.log(`OTHER Files: ${formatSize(stats.other.size)} (${percentage}%)`);
    stats.other.files.slice(0, 5).forEach(file => {
        console.log(`   ├── ${file.path}: ${formatSize(file.size)}`);
    });
    console.log('');
}

// Phân tích JS Chunks chi tiết
console.log('🧩 PHÂN TÍCH JS CHUNKS CHI TIẾT');
console.log('==================================================');

const allJsFiles = stats.js.files.concat(stats.other.files.filter(f => f.name.includes('.js')));
allJsFiles.sort((a, b) => b.size - a.size);

allJsFiles.slice(0, 15).forEach((file, index) => {
    const percentage = ((file.size / stats.totalSize) * 100).toFixed(1);
    let fileType = 'Application Code';

    if (file.name.startsWith('chunk.')) {
        fileType = 'Shared Chunk';
    } else if (file.name.includes('index-')) {
        fileType = 'Main Entry Point';
    } else if (file.name === 'sw.js') {
        fileType = 'Service Worker';
    }

    console.log(`${index + 1}. ${file.path}`);
    console.log(`   Kích thước: ${formatSize(file.size)} (${percentage}% tổng bundle)`);
    console.log(`   📦 Loại: ${fileType}\n`);
});

// Cảnh báo hiệu suất
console.log('⚠️  CẢNH BÁO HIỆU SUẤT');
console.log('==================================================');

const warnings = [];

if (stats.totalSize > 2 * 1024 * 1024) {
    warnings.push(`Tổng bundle size (${formatSize(stats.totalSize)}) lớn hơn 2MB - có thể ảnh hưởng tới tốc độ load`);
}

if (stats.js.files.length > 15) {
    warnings.push(`Có ${stats.js.files.length} JS files - quá nhiều requests có thể làm chậm trang`);
}

const largeChunks = stats.js.files.filter(f => f.size > 500 * 1024);
if (largeChunks.length > 0) {
    warnings.push(`Có ${largeChunks.length} chunk(s) lớn hơn 500KB`);
    largeChunks.forEach(chunk => {
        warnings.push(`     • ${chunk.path}: ${formatSize(chunk.size)}`);
    });
}

if (warnings.length === 0) {
    console.log('✅ Không có cảnh báo hiệu suất nào!');
} else {
    warnings.forEach(warning => {
        console.log(`⚠️  ${warning}`);
    });
}

// Đề xuất tối ưu hóa
console.log('\n💡 ĐỀ XUẤT TỐI ƯU HÓA');
console.log('==================================================');

const suggestions = [];

if (stats.totalSize > 2 * 1024 * 1024) {
    suggestions.push('Sử dụng dynamic import() cho các component không cần thiết ngay lập tức');
    suggestions.push('Tách vendor libraries thành chunk riêng với cacheFirst strategy');
}

if (largeChunks.length > 0) {
    suggestions.push('Sử dụng tree shaking để loại bỏ code không sử dụng');
    suggestions.push('Phân tách các chunk lớn thành chunks nhỏ hơn');
}

if (stats.images.size > 100 * 1024) {
    suggestions.push('Compress images và sử dụng format WebP');
}

if (stats.js.files.length > 15) {
    suggestions.push('Lazy load các route components với React.lazy()');
    suggestions.push('Hợp nhất các chunk nhỏ để giảm số lượng requests');
}

if (suggestions.length === 0) {
    console.log('✅ Bundle đã được tối ưu hóa tốt!');
} else {
    suggestions.forEach((suggestion, index) => {
        console.log(`💡 ${index + 1}. ${suggestion}`);
    });
}

console.log('\n✅ Phân tích hoàn tất!');
