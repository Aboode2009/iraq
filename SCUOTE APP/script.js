// التطبيق الرئيسي مع تفاعل قاعدة البيانات
class ScoutsApp {
    constructor() {
        this.db = scoutsDB;
        this.currentUser = null;
        this.init();
    }

    init() {
        this.checkAuth();
        this.setupEventListeners();
        this.loadHomePage();
        this.setupNavigation();
    }

    checkAuth() {
        const savedUser = localStorage.getItem('scouts_current_user');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.updateUIForLoggedInUser();
        }
    }

    setupEventListeners() {
        // أحداث التسجيل
        document.getElementById('loginBtn').addEventListener('click', () => this.showModal('loginModal'));
        document.getElementById('registerBtn').addEventListener('click', () => this.showModal('registerModal'));
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
        
        // أحداث النماذج
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerForm').addEventListener('submit', (e) => this.handleRegister(e));
        document.getElementById('addVideoForm').addEventListener('submit', (e) => this.handleAddVideo(e));
        document.getElementById('addEventForm').addEventListener('submit', (e) => this.handleAddEvent(e));
        
        // أحداث الأزرار
        document.getElementById('addVideoBtn').addEventListener('click', () => this.showAddVideoModal());
        document.getElementById('addEventBtn').addEventListener('click', () => this.showAddEventModal());
        document.getElementById('joinBtn').addEventListener('click', () => this.showModal('registerModal'));
        document.getElementById('watchVideoBtn').addEventListener('click', () => this.showPage('videos'));
        
        // التنقل بين النماذج
        document.getElementById('showRegisterFromLogin').addEventListener('click', (e) => {
            e.preventDefault();
            this.showModal('registerModal');
            this.hideModal('loginModal');
        });
        
        document.getElementById('showLoginFromRegister').addEventListener('click', (e) => {
            e.preventDefault();
            this.showModal('loginModal');
            this.hideModal('registerModal');
        });

        // إغلاق النماذج
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal').style.display = 'none';
            });
        });

        // إغلاق النماذج عند النقر خارجها
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
    }

    setupNavigation() {
        // التنقل بين الصفحات
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                this.showPage(page);
                
                // تحديث التنقل النشط
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });

        // الروابط في الفوتر
        document.querySelectorAll('.footer-links a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                this.showPage(page);
            });
        });
    }

    showPage(pageId) {
        // إخفاء جميع الصفحات
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // إظهار الصفحة المطلوبة
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
            this.loadPageContent(pageId);
        }
    }

    loadPageContent(pageId) {
        switch(pageId) {
            case 'home':
                this.loadHomePage();
                break;
            case 'videos':
                this.loadVideosPage();
                break;
            case 'events':
                this.loadEventsPage();
                break;
            case 'members':
                this.loadMembersPage();
                break;
            case 'gallery':
                this.loadGalleryPage();
                break;
        }
    }

    loadHomePage() {
        this.loadHomeVideos();
        this.loadHomeEvents();
        this.updateStats();
    }

    loadHomeVideos() {
        const videos = this.db.getVideos().slice(0, 3);
        const grid = document.getElementById('homeVideosGrid');
        
        if (grid) {
            grid.innerHTML = videos.map(video => `
                <div class="video-card" onclick="app.playVideo(${video.id})">
                    <div class="video-thumbnail">🎬</div>
                    <div class="video-info">
                        <div class="video-title">${video.title}</div>
                        <p class="video-description">${video.description}</p>
                        <div class="video-meta">
                            <span>${video.uploader}</span>
                            <span>${this.formatDate(video.date)}</span>
                        </div>
                        <div class="video-meta">
                            <span>👁️ ${this.formatNumber(video.views)}</span>
                            <span>⏱️ ${video.duration}</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    loadHomeEvents() {
        const events = this.db.getEvents().slice(0, 3);
        const grid = document.getElementById('homeEventsGrid');
        
        if (grid) {
            grid.innerHTML = events.map(event => `
                <div class="event-card">
                    <div class="event-info">
                        <h3>${event.title}</h3>
                        <p>${event.description}</p>
                        <div class="event-meta">
                            <span>📍 ${event.location}</span>
                            <span>👥 ${this.formatNumber(event.participants)} مشارك</span>
                        </div>
                    </div>
                    <div class="event-date">
                        ${this.formatDate(event.date)}
                    </div>
                </div>
            `).join('');
        }
    }

    loadVideosPage() {
        const videos = this.db.getVideos();
        const grid = document.getElementById('videosGrid');
        
        if (grid) {
            grid.innerHTML = videos.map(video => `
                <div class="video-card" onclick="app.playVideo(${video.id})">
                    <div class="video-thumbnail">🎬</div>
                    <div class="video-info">
                        <div class="video-title">${video.title}</div>
                        <p class="video-description">${video.description}</p>
                        <div class="video-meta">
                            <span>${video.uploader}</span>
                            <span>${this.formatDate(video.date)}</span>
                        </div>
                        <div class="video-meta">
                            <span>👁️ ${this.formatNumber(video.views)}</span>
                            <span>⏱️ ${video.duration}</span>
                            <span>🏷️ ${video.category}</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    loadEventsPage() {
        const events = this.db.getEvents();
        const grid = document.getElementById('eventsGrid');
        
        if (grid) {
            grid.innerHTML = events.map(event => `
                <div class="event-card">
                    <div class="event-info">
                        <h3>${event.title}</h3>
                        <p>${event.description}</p>
                        <div class="event-meta">
                            <span>📍 ${event.location}</span>
                            <span>👥 ${this.formatNumber(event.participants)} مشارك</span>
                            <span>🏷️ ${event.type}</span>
                            <span class="status-${event.status}">${event.status}</span>
                        </div>
                    </div>
                    <div class="event-date">
                        ${this.formatDate(event.date)}
                    </div>
                </div>
            `).join('');
        }
    }

    loadMembersPage() {
        const members = this.db.getMembers();
        const grid = document.getElementById('membersGrid');
        
        if (grid) {
            grid.innerHTML = members.map(member => `
                <div class="member-card">
                    <div class="member-avatar">${member.name.charAt(0)}</div>
                    <div class="member-info">
                        <h3>${member.name}</h3>
                        <p class="member-role">${member.role}</p>
                        <div class="member-details">
                            <span>📍 ${member.branch}</span>
                            <span>📅 منذ ${member.joinDate}</span>
                            <span class="status-${member.status}">${member.status}</span>
                        </div>
                        <div class="member-contact">
                            <span>📧 ${member.email}</span>
                            <span>📱 ${member.phone}</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    loadGalleryPage() {
        const gallery = this.db.getGallery();
        const grid = document.getElementById('galleryGrid');
        
        if (grid) {
            grid.innerHTML = gallery.map(item => `
                <div class="gallery-item">
                    <div class="gallery-image">
                        ${item.image}
                    </div>
                    <div class="gallery-content">
                        <h4>${item.title}</h4>
                        <p>${item.description}</p>
                        <div class="gallery-meta">
                            <span>${this.formatDate(item.date)}</span>
                            <span>🏷️ ${item.category}</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    updateStats() {
        const stats = this.db.getStats();
        
        document.getElementById('statYears').textContent = '65+';
        document.getElementById('statScouts').textContent = '25,000+';
        document.getElementById('statBranches').textContent = '120+';
        document.getElementById('statLeaders').textContent = '500+';
    }

    showModal(modalId) {
        document.getElementById(modalId).style.display = 'block';
    }

    hideModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }

    showAddVideoModal() {
        if (this.currentUser) {
            this.showModal('addVideoModal');
        } else {
            this.showModal('loginModal');
            this.showNotification('يرجى تسجيل الدخول أولاً', 'info');
        }
    }

    showAddEventModal() {
        if (this.currentUser) {
            this.showModal('addEventModal');
        } else {
            this.showModal('loginModal');
            this.showNotification('يرجى تسجيل الدخول أولاً', 'info');
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        const user = this.db.getUserByEmail(email);
        
        if (user && user.password === password) {
            this.currentUser = user;
            localStorage.setItem('scouts_current_user', JSON.stringify(user));
            this.updateUIForLoggedInUser();
            this.hideModal('loginModal');
            this.showNotification('مرحباً بعودتك!', 'success');
            document.getElementById('loginForm').reset();
        } else {
            this.showNotification('البريد الإلكتروني أو كلمة المرور غير صحيحة', 'error');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const role = document.getElementById('registerRole').value;

        if (this.db.getUserByEmail(email)) {
            this.showNotification('هذا البريد الإلكتروني مسجل مسبقاً', 'error');
            return;
        }

        const user = {
            name,
            email,
            password,
            role,
            avatar: name.charAt(0)
        };

        this.db.addUser(user);
        this.currentUser = user;
        localStorage.setItem('scouts_current_user', JSON.stringify(user));
        
        // إضافة المستخدم الجديد إلى قائمة الأعضاء
        this.db.addMember({
            name,
            role,
            email,
            phone: 'غير محدد',
            branch: 'غير محدد',
            joinDate: new Date().getFullYear().toString()
        });

        this.updateUIForLoggedInUser();
        this.hideModal('registerModal');
        this.showNotification(`أهلاً وسهلاً بك ${name}!`, 'success');
        document.getElementById('registerForm').reset();
    }

    handleAddVideo(e) {
        e.preventDefault();
        const title = document.getElementById('videoTitle').value;
        const url = document.getElementById('videoUrl').value;
        const description = document.getElementById('videoDescription').value;

        const video = {
            title,
            url,
            description,
            uploader: this.currentUser.name,
            duration: '00:00',
            category: 'عام'
        };

        this.db.addVideo(video);
        this.hideModal('addVideoModal');
        this.showNotification('تم إضافة الفيديو بنجاح!', 'success');
        document.getElementById('addVideoForm').reset();
        
        // تحديث العرض
        this.loadVideosPage();
        this.loadHomeVideos();
    }

    handleAddEvent(e) {
        e.preventDefault();
        const title = document.getElementById('eventTitle').value;
        const date = document.getElementById('eventDate').value;
        const location = document.getElementById('eventLocation').value;
        const description = document.getElementById('eventDescription').value;

        const event = {
            title,
            date,
            location,
            description,
            type: 'فعالية'
        };

        this.db.addEvent(event);
        this.hideModal('addEventModal');
        this.showNotification('تم إضافة الفعالية بنجاح!', 'success');
        document.getElementById('addEventForm').reset();
        
        // تحديث العرض
        this.loadEventsPage();
        this.loadHomeEvents();
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('scouts_current_user');
        this.updateUIForLoggedOutUser();
        this.showNotification('تم تسجيل الخروج بنجاح', 'info');
    }

    updateUIForLoggedInUser() {
        document.getElementById('loginBtn').style.display = 'none';
        document.getElementById('registerBtn').style.display = 'none';
        document.getElementById('userMenu').style.display = 'flex';
        document.getElementById('userName').textContent = this.currentUser.name;
        
        // إظهار أزرار الإضافة
        document.getElementById('addVideoBtn').style.display = 'block';
        document.getElementById('addEventBtn').style.display = 'block';
    }

    updateUIForLoggedOutUser() {
        document.getElementById('loginBtn').style.display = 'flex';
        document.getElementById('registerBtn').style.display = 'flex';
        document.getElementById('userMenu').style.display = 'none';
        
        // إخفاء أزرار الإضافة
        document.getElementById('addVideoBtn').style.display = 'none';
        document.getElementById('addEventBtn').style.display = 'none';
    }

    playVideo(videoId) {
        const video = this.db.getVideos().find(v => v.id === videoId);
        if (video) {
            this.showNotification(`جاري تحضير الفيديو: "${video.title}"`, 'info');
            // في التطبيق الحقيقي، سيتم فتح مشغل الفيديو
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation' : 'info'}-circle"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideInRight 0.3s ease-out reverse';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 4000);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    formatNumber(num) {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }
}

// تهيئة التطبيق عند تحميل الصفحة
let app;
document.addEventListener('DOMContentLoaded', function() {
    app = new ScoutsApp();
});
// في دالة handleAddVideo سنغير طريقة التخزين
async handleAddVideo(e) {
    e.preventDefault();
    const title = document.getElementById('videoTitle').value;
    const description = document.getElementById('videoDescription').value;
    const category = document.getElementById('videoCategory').value;
    const fileInput = document.getElementById('videoFile');
    const file = fileInput.files[0];

    if (!file) {
        this.showNotification('يرجى اختيار ملف فيديو', 'error');
        return;
    }

    const uploadBtn = document.getElementById('uploadBtn');
    uploadBtn.disabled = true;
    uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الرفع...';

    try {
        // بدلاً من تخزين الفيديو كاملاً، سنستخدم رابط وهمي
        const video = {
            title,
            description,
            uploader: this.currentUser.name,
            category: category,
            // استخدام رابط فيديو تجريبي بدلاً من التخزين المحلي
            videoUrl: this.getDemoVideoUrl(),
            filename: file.name,
            size: file.size,
            duration: "02:30" // مدة افتراضية
        };

        const newVideo = this.db.addVideo(video);
        
        // محاكاة عملية الرفع
        await this.simulateUpload();
        
        document.getElementById('addVideoForm').reset();
        document.getElementById('fileName').textContent = 'لم يتم اختيار ملف';
        
        this.hideModal('addVideoModal');
        this.showNotification('تم رفع الفيديو بنجاح!', 'success');
        
        this.loadVideosPage();
        this.loadHomeVideos();
        
    } catch (error) {
        this.showNotification('حدث خطأ أثناء رفع الفيديو', 'error');
        console.error('Upload error:', error);
    } finally {
        uploadBtn.disabled = false;
        uploadBtn.innerHTML = '<i class="fas fa-upload"></i> رفع الفيديو';
    }
}

// دالة لإرجاع روابط فيديوهات تجريبية
getDemoVideoUrl() {
    const demoVideos = [
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
    ];
    return demoVideos[Math.floor(Math.random() * demoVideos.length)];
}

// محاكاة عملية الرفع
simulateUpload() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, 2000); // 2 ثانية فقط بدلاً من الانتظار الطويل
    });
}

// وفي دالة playVideo نغير طريقة التشغيل
playVideo(videoId) {
    const video = this.db.getVideos().find(v => v.id === videoId);
    if (video) {
        const newViews = this.db.addVideoView(videoId);
        
        document.getElementById('videoPlayerTitle').textContent = video.title;
        document.getElementById('videoPlayerViews').textContent = `👁️ ${this.formatNumber(newViews)} مشاهدة`;
        document.getElementById('videoPlayerDate').textContent = `📅 ${this.formatDate(video.date)}`;
        
        // استخدام الرابط المباشر بدلاً من البيانات المخزنة محلياً
        const videoElement = document.getElementById('videoPlayerVideo');
        videoElement.src = video.videoUrl;
        
        document.getElementById('videoPlayerModal').style.display = 'block';
        
        this.loadVideosPage();
        this.loadHomeVideos();
    }
}
