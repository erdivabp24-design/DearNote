
const form = document.getElementById('guestForm');
const statusText = document.getElementById('formStatus');
const messageList = document.getElementById('messageList');

const configured =
  window.SUPABASE_URL &&
  window.SUPABASE_ANON_KEY &&
  !window.SUPABASE_URL.includes('MASUKKAN_') &&
  !window.SUPABASE_ANON_KEY.includes('MASUKKAN_');

let db = null;

if (configured && window.supabase) {
  db = window.supabase.createClient(
    window.SUPABASE_URL,
    window.SUPABASE_ANON_KEY
  );
}

async function loadMessages() {
  if (!db) {
    messageList.innerHTML =
      '<p class="empty">Hubungkan Supabase terlebih dahulu.</p>';
    return;
  }

  messageList.innerHTML =
    '<p class="empty">Memuat pesan...</p>';

  const { data, error } = await db
    .from('guestbook')
    .select('id,name,message,created_at')
    .order('created_at', { ascending: false });

  if (error) {
    messageList.textContent =
      'Pesan belum dapat dimuat. Periksa database.';
    console.error(error);
    return;
  }

  if (!data.length) {
    messageList.innerHTML =
      '<p class="empty">Belum ada pesan. Jadilah pengunjung pertama!</p>';
    return;
  }

  messageList.replaceChildren();

  data.forEach(item => {
    const article = document.createElement('article');
    article.className = 'message-item';

    const name = document.createElement('strong');
    name.textContent = item.name;

    const message = document.createElement('p');
    message.textContent = item.message;

    const date = document.createElement('small');
    date.textContent = new Date(
      item.created_at
    ).toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    article.append(name, message, date);
    messageList.append(article);
  });
}

form.addEventListener('submit', async event => {
  event.preventDefault();

  if (!db) {
    statusText.textContent =
      'Database belum dihubungkan.';
    return;
  }

  const name = document
    .getElementById('visitorName')
    .value.trim();

  const message = document
    .getElementById('visitorMessage')
    .value.trim();

  if (!name || !message) return;

  const submit = form.querySelector('button[type="submit"]');

  submit.disabled = true;
  submit.textContent = 'Mengirim...';

  const { error } = await db
    .from('guestbook')
    .insert([{ name, message }]);

  submit.disabled = false;
  submit.textContent = 'Kirim Pesan →';

  if (error) {
    statusText.textContent =
      'Pesan gagal dikirim. Periksa koneksi database.';
    console.error(error);
    return;
  }

  form.reset();
  statusText.textContent =
    'Pesan berhasil dikirim. Terima kasih!';

  await loadMessages();
});

document
  .getElementById('refreshBtn')
  .addEventListener('click', loadMessages);

loadMessages();
