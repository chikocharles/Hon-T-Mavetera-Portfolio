import { sendMessageToGemini } from './services/geminiService';

// Navbar Logic
const navbar = document.getElementById('navbar');
const navBrand = document.getElementById('nav-brand');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const mobileLinks = document.querySelectorAll('.mobile-link');

// Scroll Effect
window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    navbar?.classList.add('scrolled');
    navBrand?.classList.remove('desktop-white');
  } else {
    navbar?.classList.remove('scrolled');
    navBrand?.classList.add('desktop-white');
  }
});

// Mobile Menu Toggle
mobileMenuBtn?.addEventListener('click', () => {
  mobileMenu?.classList.toggle('open');
});

mobileLinks.forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu?.classList.remove('open');
  });
});

// Desktop Timeline Alignment Fix via JS (since CSS grid/flex logic is simpler with JS for alternating)
const timelineItems = document.querySelectorAll('.timeline-item');
const timelineMetas = document.querySelectorAll('.timeline-meta.hidden.md-block');

const handleResize = () => {
  if (window.innerWidth >= 768) {
    timelineMetas.forEach((meta, index) => {
      (meta as HTMLElement).style.display = 'flex';
    });
  } else {
    timelineMetas.forEach((meta, index) => {
      (meta as HTMLElement).style.display = 'none';
    });
  }
};
window.addEventListener('resize', handleResize);
handleResize();

// Chat Widget Logic
const chatWindow = document.getElementById('chat-window');
const toggleChatBtn = document.getElementById('toggle-chat-btn');
const closeChatBtn = document.getElementById('close-chat-btn');
const openIcon = document.getElementById('open-icon');
const closeIcon = document.getElementById('close-icon');
const chatMessages = document.getElementById('chat-messages');
const inputField = document.getElementById('input-field') as HTMLInputElement;
const sendBtn = document.getElementById('send-btn') as HTMLButtonElement;

let isChatOpen = false;
let isTyping = false;

const toggleChat = () => {
  isChatOpen = !isChatOpen;
  if (isChatOpen) {
    chatWindow?.classList.add('open');
    toggleChatBtn?.classList.remove('closed');
    toggleChatBtn?.classList.add('open');
    openIcon?.classList.add('hidden');
    closeIcon?.classList.remove('hidden');
  } else {
    chatWindow?.classList.remove('open');
    toggleChatBtn?.classList.remove('open');
    toggleChatBtn?.classList.add('closed');
    openIcon?.classList.remove('hidden');
    closeIcon?.classList.add('hidden');
  }
};

toggleChatBtn?.addEventListener('click', toggleChat);
closeChatBtn?.addEventListener('click', toggleChat);

const addMessage = (text: string, role: 'user' | 'model') => {
  const wrapper = document.createElement('div');
  wrapper.className = `msg-wrapper ${role}`;
  
  const bubble = document.createElement('div');
  bubble.className = `msg-bubble ${role}`;
  bubble.textContent = text;
  
  wrapper.appendChild(bubble);
  chatMessages?.appendChild(wrapper);
  chatMessages!.scrollTop = chatMessages!.scrollHeight;
};

const showTyping = () => {
  const wrapper = document.createElement('div');
  wrapper.id = 'typing-indicator';
  wrapper.className = 'msg-wrapper model';
  
  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble model';
  
  const dots = document.createElement('div');
  dots.className = 'typing-dots';
  
  for(let i=0; i<3; i++) {
    const dot = document.createElement('div');
    dot.className = 'dot';
    dots.appendChild(dot);
  }
  
  bubble.appendChild(dots);
  wrapper.appendChild(bubble);
  chatMessages?.appendChild(wrapper);
  chatMessages!.scrollTop = chatMessages!.scrollHeight;
};

const removeTyping = () => {
  const indicator = document.getElementById('typing-indicator');
  if (indicator) indicator.remove();
};

const handleSend = async () => {
  const text = inputField.value.trim();
  if (!text || isTyping) return;

  addMessage(text, 'user');
  inputField.value = '';
  sendBtn.disabled = true;
  isTyping = true;

  showTyping();

  try {
    const response = await sendMessageToGemini(text);
    removeTyping();
    addMessage(response, 'model');
  } catch (e) {
    removeTyping();
    addMessage("I apologize, I couldn't connect at the moment.", 'model');
  } finally {
    isTyping = false;
    sendBtn.disabled = !inputField.value.trim();
  }
};

sendBtn?.addEventListener('click', handleSend);

inputField?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleSend();
});

inputField?.addEventListener('input', () => {
  sendBtn.disabled = !inputField.value.trim();
});
