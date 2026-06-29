/**
 * Vinmec International Hospital - High Fidelity Clone Interactive Script
 * Handcrafted with Vanilla JS for high performance and smooth experiences.
 */

// ==========================================
// CẤU HÌNH API KEY Ở ĐÂY: Dán key của bạn vào giữa hai dấu nháy dưới đây
// ==========================================
const ANTCO_DEFAULT_API_KEY = 'sk--gCsYOg8eoDaOPTS7OsExA'
;


document.addEventListener('DOMContentLoaded', () => {
    initHeroSlider();
    initSearchSuggestions();
    initClinicShowcase();
    initLocationDetector();
    loadChatbotSettings();
    initBookingListeners();
});

// ==========================================
// 1. Hero Slider Logic
// ==========================================
let currentSlideIndex = 0;
let sliderInterval;

function initHeroSlider() {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    if (slides.length === 0) return;

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        currentSlideIndex = (index + slides.length) % slides.length;
        slides[currentSlideIndex].classList.add('active');
        dots[currentSlideIndex].classList.add('active');
    }

    window.currentSlide = function(index) {
        showSlide(index);
        resetSliderTimer();
    }

    function nextSlide() {
        showSlide(currentSlideIndex + 1);
    }

    function resetSliderTimer() {
        clearInterval(sliderInterval);
        sliderInterval = setInterval(nextSlide, 5000); // Change banner every 5 seconds
    }

    resetSliderTimer();
}

// ==========================================
// 2. Mobile Nav Drawer & Search Toggle
// ==========================================
function toggleMobileDrawer() {
    const drawer = document.getElementById('mobile-drawer');
    const overlay = document.querySelector('.dark-overlay') || createOverlay();
    
    drawer.classList.toggle('active');
    overlay.classList.toggle('hide');
    overlay.classList.toggle('active');
    
    // Close mobile search if open
    document.querySelector('.search-bar-wrapper').classList.remove('active');
}

function toggleMobileSearch() {
    const searchWrapper = document.querySelector('.search-bar-wrapper');
    searchWrapper.classList.toggle('active');
    if (searchWrapper.classList.contains('active')) {
        document.getElementById('search-input').focus();
    }
}

function createOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay dark-overlay hide';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', () => {
        document.getElementById('mobile-drawer').classList.remove('active');
        closeHotlineModal();
        closeSuccessModal();
        overlay.classList.add('hide');
        overlay.classList.remove('active');
    });
    return overlay;
}

// ==========================================
// 3. Search Live Suggestions Logic
// ==========================================
const MOCK_SUGGESTIONS = {
    chuyenkhoa: [
        { name: 'Trung tâm Tim mạch', url: '#chuyen-khoa' },
        { name: 'Trung tâm Ung bướu', url: '#chuyen-khoa' },
        { name: 'Sản phụ khoa & Hỗ trợ sinh sản', url: '#chuyen-khoa' },
        { name: 'Trung tâm Nhi khoa', url: '#chuyen-khoa' },
        { name: 'Chấn thương chỉnh hình & Y học thể thao', url: '#chuyen-khoa' }
    ],
    doctor: [
        { name: 'GS.TS. Nguyễn Gia Bình - Hồi sức tích cực', thumb: 'assets/images/why_us_doctor.jpg' },
        { name: 'PGS.TS. Nguyễn Thị Lâm - Dinh dưỡng', thumb: 'assets/images/why_us_doctor.jpg' },
        { name: 'ThS.BS. Lê Nhất Huy - Tim mạch can thiệp', thumb: 'assets/images/why_us_doctor.jpg' },
        { name: 'BSCKII. Trần Thị Minh - Sản khoa', thumb: 'assets/images/why_us_doctor.jpg' }
    ],
    disease: [
        { name: 'Cao huyết áp (Tăng huyết áp)', url: '#' },
        { name: 'Tiểu đường (Đái tháo đường Tuýp 2)', url: '#' },
        { name: 'Trào ngược dạ dày thực quản (GERD)', url: '#' },
        { name: 'Cúm A và các dịch bệnh mùa đông xuân', url: '#' }
    ]
};

function initSearchSuggestions() {
    const searchInput = document.getElementById('search-input');
    const dropdown = document.getElementById('suggestions-dropdown');
    if (!searchInput || !dropdown) return;

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim().toLowerCase();
        if (query.length < 2) {
            dropdown.classList.remove('active');
            dropdown.innerHTML = '';
            return;
        }

        // Filter mock database
        const results = {
            chuyenkhoa: MOCK_SUGGESTIONS.chuyenkhoa.filter(item => item.name.toLowerCase().includes(query)),
            doctor: MOCK_SUGGESTIONS.doctor.filter(item => item.name.toLowerCase().includes(query)),
            disease: MOCK_SUGGESTIONS.disease.filter(item => item.name.toLowerCase().includes(query))
        };

        // Render matching suggestion items
        let hasResults = false;
        let html = '';

        const groupTitles = {
            chuyenkhoa: 'Chuyên khoa',
            doctor: 'Bác sĩ & Chuyên gia',
            disease: 'Tra cứu bệnh lý'
        };

        for (const [key, list] of Object.entries(results)) {
            if (list.length > 0) {
                hasResults = true;
                html += `<div class="suggestion-group-title">${groupTitles[key]}</div>`;
                list.forEach(item => {
                    const imgSrc = item.thumb ? item.thumb : null;
                    html += `
                        <div class="suggestion-item" onclick="selectSuggestion('${item.name}')">
                            ${imgSrc ? `<img src="${imgSrc}" alt="${item.name}">` : `<i class="fa-solid fa-magnifying-glass" style="margin-right:12px; color:var(--text-light);"></i>`}
                            <div class="suggestion-info">
                                <div class="suggestion-title">${highlightMatch(item.name, query)}</div>
                            </div>
                        </div>
                    `;
                });
            }
        }

        if (hasResults) {
            dropdown.innerHTML = html;
            dropdown.classList.add('active');
        } else {
            dropdown.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--text-muted); font-size: 0.9rem;"><i class="fa-solid fa-face-meh"></i> Không tìm thấy kết quả phù hợp.</div>`;
            dropdown.classList.add('active');
        }
    });

    // Hide dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });
}

function highlightMatch(text, query) {
    const idx = text.toLowerCase().indexOf(query);
    if (idx === -1) return text;
    return text.substring(0, idx) + '<strong>' + text.substring(idx, idx + query.length) + '</strong>' + text.substring(idx + query.length);
}

function selectSuggestion(name) {
    document.getElementById('search-input').value = name;
    document.getElementById('suggestions-dropdown').classList.remove('active');
    triggerSearch();
}

function triggerSearch() {
    const query = document.getElementById('search-input').value.trim();
    if (query) {
        alert('Đang tìm kiếm thông tin về: ' + query);
    }
}

function focusSearch() {
    const input = document.getElementById('search-input');
    input.focus();
    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ==========================================
// 4. Clinic Showcase Navigation (Tabs)
// ==========================================
const CLINIC_DATA = [
    {
        name: 'Bệnh viện Đa khoa Quốc tế Vinmec Times City',
        desc: 'Bệnh viện đa khoa đầu tiên của hệ thống đạt chứng nhận JCI danh giá. Tọa lạc tại khu đô thị Times City Hà Nội với quy mô hơn 500 giường bệnh chuyên sâu và đầy đủ trang thiết bị đẳng cấp quốc tế.',
        img: 'assets/images/clinics/clinic_times_city.jpg'
    },
    {
        name: 'Bệnh viện Đa khoa Quốc tế Vinmec Central Park',
        desc: 'Nằm tại trung tâm TP. Hồ Chí Minh (khu Vinhomes Central Park), sở hữu đội ngũ chuyên gia đầu ngành trong phẫu thuật tim mạch nội soi và hỗ trợ sinh sản hàng đầu Việt Nam.',
        img: 'assets/images/banners/banner_maternity.jpg'
    },
    {
        name: 'Bệnh viện Đa khoa Quốc tế Vinmec Smart City',
        desc: 'Bệnh viện thông minh thế hệ mới tích hợp đầy đủ công nghệ AI trong chuẩn đoán hình ảnh, hồ sơ bệnh án số hóa đồng bộ và quy trình chăm sóc sức khỏe chuẩn y khoa Hoa Kỳ.',
        img: 'assets/images/banners/banner_cardiology.jpg'
    }
];

function initClinicShowcase() {
    window.switchClinic = function(index) {
        const pickerItems = document.querySelectorAll('.clinic-picker-item');
        const showcaseImg = document.getElementById('showcase-img');
        const showcaseName = document.getElementById('showcase-name');
        const showcaseDesc = document.getElementById('showcase-desc');

        if (index < 0 || index >= CLINIC_DATA.length) return;

        // Update picker active style
        pickerItems.forEach(item => item.classList.remove('active'));
        pickerItems[index].classList.add('active');

        // Apply cross-fade transition to large display
        showcaseImg.style.opacity = '0.3';
        setTimeout(() => {
            showcaseImg.src = CLINIC_DATA[index].img;
            showcaseName.textContent = CLINIC_DATA[index].name;
            showcaseDesc.textContent = CLINIC_DATA[index].desc;
            showcaseImg.style.opacity = '1';
        }, 150);
    }
}

// ==========================================
// 5. Geo Location distance calculator (Closest Hospital)
// ==========================================
const HOSPITAL_LOCATIONS = [
    { name: 'Times City', label: 'Vinmec Times City (Hà Nội)', lat: 20.9964, lon: 105.8669 },
    { name: 'Central Park', label: 'Vinmec Central Park (TP. HCM)', lat: 10.7948, lon: 106.7203 },
    { name: 'Smart City', label: 'Vinmec Smart City (Hà Nội)', lat: 21.0077, lon: 105.7473 },
    { name: 'Da Nang', label: 'Vinmec Đà Nẵng', lat: 16.0391, lon: 108.2112 },
    { name: 'Nha Trang', label: 'Vinmec Nha Trang', lat: 12.2129, lon: 109.2107 },
    { name: 'Hai Phong', label: 'Vinmec Hải Phòng', lat: 20.8234, lon: 106.6879 },
    { name: 'Ha Long', label: 'Vinmec Hạ Long', lat: 20.9522, lon: 107.0721 },
    { name: 'Phu Quoc', label: 'Vinmec Phú Quốc', lat: 10.3415, lon: 103.8547 },
    { name: 'Can Tho', label: 'Vinmec Cần Thơ', lat: 10.0264, lon: 105.7698 },
    { name: 'Ocean Park 2', label: 'Vinmec Ocean Park 2', lat: 20.9412, lon: 105.9754 }
];

function initLocationDetector() {
    // Request permission on load
    setTimeout(requestUserLocation, 1000);
}

function requestUserLocation() {
    const titleEl = document.getElementById('detected-hospital-title');
    const descEl = document.getElementById('detected-distance-desc');
    
    if (!titleEl || !descEl) return;

    titleEl.textContent = "Đang dò quét tọa độ...";
    
    if (!navigator.geolocation) {
        fallbackToDefault("Trình duyệt không hỗ trợ định vị.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const userLat = position.coords.latitude;
            const userLon = position.coords.longitude;
            findClosestHospital(userLat, userLon);
        },
        (error) => {
            console.log("Location access error:", error);
            fallbackToDefault("Quyền định vị bị từ chối.");
        },
        { timeout: 10000 }
    );
}

function findClosestHospital(lat, lon) {
    let closest = null;
    let minDistance = Infinity;

    HOSPITAL_LOCATIONS.forEach(hosp => {
        const dist = calculateHaversineDistance(lat, lon, hosp.lat, hosp.lon);
        if (dist < minDistance) {
            minDistance = dist;
            closest = hosp;
        }
    });

    if (closest) {
        // Update booking dropdown
        const selectBox = document.getElementById('booking-hospital');
        if (selectBox) {
            selectBox.value = closest.name;
        }

        // Update detection banner info
        const titleEl = document.getElementById('detected-hospital-title');
        const descEl = document.getElementById('detected-distance-desc');
        
        titleEl.innerHTML = `Cơ sở gần bạn nhất: <strong style="color: var(--primary-blue);">${closest.label}</strong>`;
        descEl.textContent = `Cách vị trí của bạn khoảng ${minDistance.toFixed(1)} km. Đã tự động chọn cơ sở này trong biểu mẫu đăng ký.`;
        
        // Cập nhật vị trí gần nhất vào System Prompt của Chatbot để LLM biết và chủ động đề xuất
        chatbotConversationHistory[0].content = `Bạn là một chuyên gia tư vấn y tế tại Vinmec. Người dùng hiện đang ở gần cơ sở: ${closest.label} (cách họ ${minDistance.toFixed(1)} km). Hãy chủ động giới thiệu hoặc đề xuất cơ sở này khi họ hỏi về triệu chứng hoặc cần đi khám chuyên khoa. Trả lời ngắn gọn, lịch sự, chu đáo.`;
        
        // Cập nhật thẻ đề xuất trong form đăng ký khám
        updateBookingRecommendation();
    }
}

function fallbackToDefault(reason) {
    const titleEl = document.getElementById('detected-hospital-title');
    const descEl = document.getElementById('detected-distance-desc');
    
    titleEl.textContent = "Vinmec Times City (Hà Nội)";
    descEl.textContent = `${reason} Hệ thống đề xuất cơ sở chính tại thủ đô Hà Nội.`;
    
    const selectBox = document.getElementById('booking-hospital');
    if (selectBox) {
        selectBox.value = "Times City";
    }
    
    // Cập nhật vị trí mặc định vào System Prompt của Chatbot
    chatbotConversationHistory[0].content = `Bạn là một chuyên gia tư vấn y tế tại Vinmec. Người dùng hiện đang ở gần cơ sở: Vinmec Times City (Hà Nội). Hãy chủ động giới thiệu hoặc đề xuất cơ sở này khi họ hỏi về triệu chứng hoặc cần đi khám chuyên khoa. Trả lời ngắn gọn, lịch sự, chu đáo.`;
    
    // Cập nhật thẻ đề xuất trong form
    updateBookingRecommendation();
}

// Distance formula (Haversine)
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// ==========================================
// 6. Modal triggers (Hotline, Booking success)
// ==========================================
function openHotlineModal() {
    const modal = document.getElementById('hotline-modal');
    const overlay = document.querySelector('.dark-overlay') || createOverlay();
    
    overlay.classList.remove('hide');
    overlay.classList.add('active');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeHotlineModal() {
    const modal = document.getElementById('hotline-modal');
    const overlay = document.querySelector('.dark-overlay');
    
    modal.classList.remove('active');
    if (overlay) {
        overlay.classList.add('hide');
        overlay.classList.remove('active');
    }
    document.body.style.overflow = '';
}

function closeSuccessModal() {
    const modal = document.getElementById('success-modal');
    const overlay = document.querySelector('.dark-overlay');
    
    modal.classList.remove('active');
    if (overlay) {
        overlay.classList.add('hide');
        overlay.classList.remove('active');
    }
    document.body.style.overflow = '';
}

// Form Booking Submit Interaction
function handleBooking(event) {
    event.preventDefault();
    
    const nameInput = document.getElementById('booking-name').value;
    const hospitalSelect = document.getElementById('booking-hospital');
    const hospitalName = hospitalSelect.options[hospitalSelect.selectedIndex].text;
    
    const successMsg = document.getElementById('success-modal-message');
    successMsg.innerHTML = `Cảm ơn anh/chị <strong>${nameInput}</strong>. Yêu cầu đăng ký khám tại <strong>${hospitalName}</strong> đã được lưu thành công. Tư vấn viên Vinmec sẽ liên lạc xác nhận lịch hẹn chính xác với anh/chị qua điện thoại trong vòng 15 phút.`;
    
    // Open success modal
    const modal = document.getElementById('success-modal');
    const overlay = document.querySelector('.dark-overlay') || createOverlay();
    
    overlay.classList.remove('hide');
    overlay.classList.add('active');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Reset form
    document.getElementById('booking-form').reset();
}

// ==========================================
// 7. Language Switch Logic
// ==========================================
function changeLanguage(lang) {
    const currentFlag = document.getElementById('current-lang-flag');
    if (lang === 'en') {
        currentFlag.src = "https://upload.wikimedia.org/wikipedia/en/thumb/a/ae/Flag_of_the_United_Kingdom.svg/1200px-Flag_of_the_United_Kingdom.svg.png";
        alert("Language changed to English (Demo)");
    } else {
        currentFlag.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Flag_of_Vietnam.svg/2000px-Flag_of_Vietnam.svg.png";
        alert("Đã chuyển đổi sang Tiếng Việt");
    }
}

// ==========================================
// 8. AI Chatbot Widget Logic
// ==========================================
function toggleChatbotWindow() {
    const chatbot = document.getElementById('chatbot-window');
    chatbot.classList.toggle('active');
    
    if (chatbot.classList.contains('active')) {
        const apiKey = localStorage.getItem('antco_api_key');
        const warningEl = document.getElementById('chatbot-setup-warning');
        if (!apiKey) {
            warningEl.style.display = 'block';
        } else {
            warningEl.style.display = 'none';
        }
        document.getElementById('chatbot-input').focus();
    }
}

function toggleChatbotSettings() {
    const pane = document.getElementById('chatbot-settings-pane');
    pane.classList.toggle('active');
}

function saveChatbotSettings() {
    const apiKey = document.getElementById('chatbot-api-key').value.trim();
    const apiUrl = document.getElementById('chatbot-api-url').value.trim();
    const apiModel = document.getElementById('chatbot-api-model').value.trim();
    
    if (!apiKey) {
        alert('Vui lòng nhập API Key từ AI Gateway!');
        return;
    }
    
    localStorage.setItem('antco_api_key', apiKey);
    localStorage.setItem('antco_api_url', apiUrl || 'https://ai-gateway.antco.ai/v1/chat/completions');
    localStorage.setItem('antco_api_model', apiModel || 'gpt-4o-mini');
    
    document.getElementById('chatbot-setup-warning').style.display = 'none';
    document.getElementById('chatbot-settings-pane').classList.remove('active');
    
    alert('Cấu hình AI Gateway đã được lưu thành công!');
}

async function loadChatbotSettings() {
    let apiKey = localStorage.getItem('antco_api_key') || (ANTCO_DEFAULT_API_KEY !== 'DÁN_KEY_CỦA_BẠN_VÀO_ĐÂY' ? ANTCO_DEFAULT_API_KEY : '');
    let apiUrl = localStorage.getItem('antco_api_url') || 'https://ai-gateway.antco.ai/v1/chat/completions';
    let apiModel = localStorage.getItem('antco_api_model') || 'gpt-4o-mini';
    
    // Thử tải cấu hình từ biến môi trường của server.js nếu có
    try {
        const response = await fetch('/api/config');
        if (response.ok) {
            const serverConfig = await response.json();
            // Nếu server cấu hình key hợp lệ, sử dụng nó làm mặc định thay thế
            if (serverConfig.apiKey && serverConfig.apiKey !== 'DÁN_KEY_CỦA_BẠN_VÀO_ĐÂY') {
                apiKey = serverConfig.apiKey;
            }
            if (serverConfig.apiUrl) {
                apiUrl = serverConfig.apiUrl;
            }
            if (serverConfig.apiModel) {
                apiModel = serverConfig.apiModel;
            }
            console.log('✅ Đã nạp thành công biến môi trường .env qua server');
        }
    } catch (e) {
        // Chạy tĩnh offline (không qua server.js), giữ nguyên localStorage/hardcode
        console.log('ℹ️ Trang web chạy ở chế độ tĩnh không qua server.');
    }
    
    const keyInput = document.getElementById('chatbot-api-key');
    const urlInput = document.getElementById('chatbot-api-url');
    const modelInput = document.getElementById('chatbot-api-model');
    
    if (keyInput) keyInput.value = apiKey;
    if (urlInput) urlInput.value = apiUrl;
    if (modelInput) modelInput.value = apiModel;
}

// Conversation state history to feed to LLM
let chatbotConversationHistory = [
    { role: 'system', content: 'Bạn là một chuyên gia tư vấn y tế thông minh và chu đáo tại Hệ thống Bệnh viện Quốc tế Vinmec. Hãy trả lời các thắc mắc của người dùng bằng tiếng Việt, ngắn gọn, lịch sự, chuyên nghiệp, thể hiện y đức và sự thấu cảm. Luôn khuyên bệnh nhân đi khám trực tiếp tại Vinmec khi gặp các triệu chứng nặng hoặc khẩn cấp.' }
];

async function sendChatMessage() {
    const inputEl = document.getElementById('chatbot-input');
    const message = inputEl.value.trim();
    if (!message) return;
    
    // Clear input
    inputEl.value = '';
    
    const messagesContainer = document.getElementById('chatbot-messages');
    
    // Check key configuration
    let apiKey = localStorage.getItem('antco_api_key');
    if (!apiKey && ANTCO_DEFAULT_API_KEY !== 'DÁN_KEY_CỦA_BẠN_VÀO_ĐÂY') {
        apiKey = ANTCO_DEFAULT_API_KEY;
    }
    
    if (!apiKey) {
        alert('Vui lòng cấu hình API Key của bạn trước khi trò chuyện!');
        toggleChatbotSettings();
        return;
    }
    
    let apiUrl = localStorage.getItem('antco_api_url') || 'https://ai-gateway.antco.ai/v1/chat/completions';
    let apiModel = localStorage.getItem('antco_api_model') || 'gpt-4o-mini';
    
    // Tự động nhận diện khóa Google AI Studio để gọi trực tiếp (Bypass Gateway nếu dùng key Google)
    if (apiKey.startsWith('AIzaSy')) {
        apiUrl = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
        if (apiModel.includes('gpt') || apiModel.includes('claude') || apiModel === 'gpt-4o-mini') {
            apiModel = 'gemini-1.5-flash';
        }
    }
    
    // 1. Add user message bubble
    appendChatBubble(message, 'user');
    
    // Add to history
    chatbotConversationHistory.push({ role: 'user', content: message });
    
    // 2. Add loading animation bubble
    const loadingBubble = appendChatBubble('', 'bot loading');
    
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: apiModel,
                messages: chatbotConversationHistory
            })
        });
        
        // Remove loading bubble
        loadingBubble.remove();
        
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            const errMsg = errData?.error?.message || `HTTP error! status: ${response.status}`;
            throw new Error(errMsg);
        }
        
        const data = await response.json();
        const botReply = data.choices[0].message.content;
        
        // 3. Add bot reply bubble
        appendChatBubble(botReply, 'bot');
        
        // Add to history
        chatbotConversationHistory.push({ role: 'assistant', content: botReply });
        
    } catch (error) {
        console.error('Chatbot API Error:', error);
        loadingBubble.remove();
        appendChatBubble(`❌ Lỗi: ${error.message}. Vui lòng kiểm tra lại API Key hoặc endpoint URL cấu hình trong cài đặt.`, 'system-error');
    }
}

function appendChatBubble(text, sender) {
    const container = document.getElementById('chatbot-messages');
    const bubble = document.createElement('div');
    bubble.className = `chat-msg ${sender}`;
    
    if (sender.includes('loading')) {
        bubble.innerHTML = `
            <div class="typing-indicator">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
            </div>
        `;
    } else {
        // Simple line break parsing
        bubble.innerText = text;
    }
    
    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;
    return bubble;
}

// ==========================================
// 9. Booking Dynamic Recommendation Logic
// ==========================================
function initBookingListeners() {
    const hospitalSelect = document.getElementById('booking-hospital');
    const specialistSelect = document.getElementById('booking-specialist');
    
    if (hospitalSelect) {
        hospitalSelect.addEventListener('change', updateBookingRecommendation);
    }
    if (specialistSelect) {
        specialistSelect.addEventListener('change', updateBookingRecommendation);
    }
    
    // Run initial recommendation
    setTimeout(updateBookingRecommendation, 1500);
}

function updateBookingRecommendation() {
    const specialistSelect = document.getElementById('booking-specialist');
    if (!specialistSelect) return;
    
    const specialistName = specialistSelect.options[specialistSelect.selectedIndex].text;
    const hospitalSelect = document.getElementById('booking-hospital');
    const hospitalName = hospitalSelect.options[hospitalSelect.selectedIndex].text;
    const recommendationEl = document.getElementById('booking-recommendation');
    const messageInput = document.getElementById('booking-message');
    
    if (!recommendationEl) return;
    
    const distanceDesc = document.getElementById('detected-distance-desc').textContent;
    
    // Kiểm tra triệu chứng khẩn cấp hoặc đặc thù nhi khoa
    let symptomWarning = '';
    if (messageInput) {
        const symptomsText = messageInput.value.toLowerCase();
        if (symptomsText.includes('đau ngực') || symptomsText.includes('tức ngực') || symptomsText.includes('tim đập nhanh') || symptomsText.includes('khó thở')) {
            symptomWarning = `<div style="margin-top:8px; padding:8px; background:#fff5f5; border-left:4px solid #e53e3e; border-radius:4px; font-size:0.8rem; color:#c53030;">
                ⚠️ <strong>Cảnh báo khẩn cấp:</strong> Nếu bạn đang đau thắt ngực lan ra vai/tay kèm vã mồ hôi, vui lòng gọi cấp cứu ngay lập tức hoặc di chuyển tới khoa Cấp cứu của <strong>${hospitalName}</strong> gần nhất thay vì đặt lịch khám thông thường.
            </div>`;
        } else if (symptomsText.includes('sốt cao') || symptomsText.includes('co giật') || symptomsText.includes('bé') || symptomsText.includes('trẻ')) {
            symptomWarning = `<div style="margin-top:8px; padding:8px; background:#f0fff4; border-left:4px solid #38a169; border-radius:4px; font-size:0.8rem; color:#276749;">
                👶 <strong>Tư vấn Nhi khoa:</strong> Khoa Nhi của <strong>${hospitalName}</strong> được trang bị đầy đủ khu vui chơi cách ly và đội ngũ bác sĩ nhi thấu cảm, rất phù hợp cho bé yêu của bạn.
            </div>`;
        }
    }
    
    recommendationEl.style.display = 'block';
    recommendationEl.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:6px;">
            <div style="display:flex; align-items:center; gap:10px;">
                <i class="fa-solid fa-hospital-user" style="font-size: 1.35rem; color: var(--green);"></i>
                <div>
                    <div style="font-weight: 700; color: #1a202c; font-size:0.9rem;">Gợi ý cơ sở khám tối ưu từ Vinmec AI:</div>
                    <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 2px;">
                        Khoa chuyên sâu phục vụ chuyên ngành <strong>${specialistName}</strong> tại <strong>${hospitalName}</strong> đang có lịch khám trống sớm nhất. ${distanceDesc}
                    </div>
                </div>
            </div>
            ${symptomWarning}
        </div>
    `;
}
