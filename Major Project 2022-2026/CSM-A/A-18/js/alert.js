// Dispatch alerts for all contacts
async function dispatchAlerts(lat, lng, address) {
  const contacts = getContacts();
  const timestamp = new Date().toLocaleString();
  
  if (contacts.length === 0) {
    console.warn('No emergency contacts found.');
    return [];
  }

  const results = [];
  
  const msg = `🚨 RESCUE ALERT 🚨
I need help immediately!
📍 Location: ${address}
🗺️ Map: https://maps.google.com/?q=${lat},${lng}
⏰ Time: ${timestamp}
Please contact me or call emergency services.`;

  const isOnline = navigator.onLine;

  contacts.forEach(contact => {
    let url;
    if (isOnline) {
      // WhatsApp deep link
      url = `https://wa.me/${contact.phone.replace(/\+/g, '')}?text=${encodeURIComponent(msg)}`;
    } else {
      // SMS fallback
      url = `sms:${contact.phone}&body=${encodeURIComponent(msg)}`;
    }
    
    // Attempt to open all contact windows (Requires "Allow Pop-ups" in browser)
    setTimeout(() => {
        window.open(url, '_blank');
    }, results.length * 200);
    
    results.push({ name: contact.name, phone: contact.phone, status: 'Sent', url: url });
  });

  return results;
}

// Blast function for multiple windows
function blastAllContacts() {
  const contacts = getContacts();
  const address = document.getElementById('current-address').textContent;
  const coordsText = document.getElementById('current-coords').textContent;
  const [lat, lng] = coordsText.split(', ').map(parseFloat);
  const timestamp = new Date().toLocaleString();

  const msg = `🚨 RESCUE BLAST ALERT 🚨\nI need help immediately!\n📍 Location: ${address}\n🗺️ Map: https://maps.google.com/?q=${lat},${lng}\n⏰ Time: ${timestamp}\nSent via RESCUE Platform.`;
  
  contacts.forEach((contact, index) => {
    // Slight delay between opens can sometimes bypass primitive filters, 
    // but a single click usually only allows one.
    // We try anyway, informing the user to allow pop-ups.
    setTimeout(() => {
        let url;
        if (navigator.onLine) {
            url = `https://wa.me/${contact.phone.replace(/\+/g, '')}?text=${encodeURIComponent(msg)}`;
        } else {
            url = `sms:${contact.phone}&body=${encodeURIComponent(msg)}`;
        }
        window.open(url, '_blank');
    }, index * 200);
  });

  alert('🚀 Alert Blast Initialized.\nIf only one contact opened, please "Allow Pop-ups" for this site to notify everyone at once.');
}
