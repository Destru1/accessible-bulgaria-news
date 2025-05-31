function toggleDark() {
  document.body.classList.toggle('dark');
}

function toggleFont() {
  document.body.classList.toggle('font-large');
}

let currentUtterance = null;
let lastBtn = null;
let isPaused = false;

function showToast(message, showResume) {
  let toast = document.getElementById('speech-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'speech-toast';
    toast.style.position = 'fixed';
    toast.style.bottom = '2rem';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.background = '#2563eb';
    toast.style.color = 'white';
    toast.style.padding = '0.75rem 1.5rem';
    toast.style.borderRadius = '8px';
    toast.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
    toast.style.fontSize = '1rem';
    toast.style.zIndex = '9999';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.gap = '1rem';
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.4s cubic-bezier(.4,0,.2,1)';
    
    const stopBtn = document.createElement('button');
    stopBtn.textContent = 'Stop';
    stopBtn.style.background = '#fff';
    stopBtn.style.color = '#2563eb';
    stopBtn.style.border = 'none';
    stopBtn.style.borderRadius = '4px';
    stopBtn.style.padding = '0.25rem 0.75rem';
    stopBtn.style.cursor = 'pointer';
    stopBtn.style.fontWeight = 'bold';
    stopBtn.onclick = function() {
      speechSynthesis.cancel();
    };
    toast.appendChild(document.createTextNode(message));
    toast.appendChild(stopBtn);
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '1'; }, 10);
  } else {
    toast.firstChild.textContent = message;
    toast.style.display = 'flex';
    setTimeout(() => { toast.style.opacity = '1'; }, 10);
  }
}

function hideToast() {
  const toast = document.getElementById('speech-toast');
  if (toast) {
    toast.style.opacity = '0';
    setTimeout(() => {
      toast.style.display = 'none';
    }, 400);
  }
}

function readTextFromButton(btn) {
  if (lastBtn === btn && currentUtterance && speechSynthesis.speaking) {
    if (!speechSynthesis.paused) {
      speechSynthesis.pause();
      isPaused = true;
      showToast('Paused. Click again to stop.', false);
    } else {
      speechSynthesis.cancel();
      isPaused = false;
      hideToast();
    }
    return;
  }

  speechSynthesis.cancel();
  let article = btn.closest('.article') || btn.closest('main');
  let text = '';
  if (article && article.dataset.readOrder === 'image-title-paragraph') {
    const img = article.querySelector('img');
    if (img && img.alt) text += img.alt + '. ';
    const title = article.querySelector('h1, h2, h3');
    if (title) text += title.innerText + '. ';
    const paragraphs = article.querySelectorAll('p');
    paragraphs.forEach(p => { text += p.innerText + ' '; });
  } 
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.onend = hideToast;
  utterance.onerror = hideToast;
  currentUtterance = utterance;
  lastBtn = btn;
  isPaused = false;
  showToast('Reading aloud...');
  speechSynthesis.speak(utterance);
}

document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.read-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      readTextFromButton(this);
    });
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      speechSynthesis.cancel();
    }
  });
  window.speechSynthesis.addEventListener('end', hideToast);
  window.speechSynthesis.addEventListener('cancel', hideToast);
  window.addEventListener('beforeunload', function() {
  speechSynthesis.cancel();
});
});
