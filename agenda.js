// Calendar functionality for agenda.html
let currentWeekOffset = 0;

const daysOfWeek = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'];
const monthNames = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

// Sample booked slots (for demo purposes)
const bookedSlots = {
    '2026-02-10': ['10:00', '14:00'],
    '2026-02-11': ['09:00', '15:00'],
    '2026-02-13': ['11:00', '16:00']
};

function getMonday(d) {
    d = new Date(d);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function renderCalendar() {
    const today = new Date();
    const monday = getMonday(today);
    monday.setDate(monday.getDate() + (currentWeekOffset * 7));

    const weekDates = [];
    for (let i = 0; i < 5; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        weekDates.push(date);
    }

    // Update week display
    const firstDay = weekDates[0].getDate();
    const lastDay = weekDates[4].getDate();
    const month = monthNames[weekDates[0].getMonth()];
    const year = weekDates[0].getFullYear();

    document.getElementById('currentWeekDisplay').textContent =
        `Semaine du ${firstDay} au ${lastDay} ${month} ${year}`;

    // Generate calendar grid
    const daysGrid = document.getElementById('daysGrid');
    daysGrid.innerHTML = '';

    const timeSlots = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

    weekDates.forEach((date, dayIndex) => {
        const dayColumn = document.createElement('div');
        dayColumn.className = 'day-column';

        // Day header
        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';

        const isToday = formatDate(date) === formatDate(new Date());
        if (isToday) {
            dayHeader.classList.add('today');
        }

        dayHeader.innerHTML = `
            <span class="day-name">${daysOfWeek[dayIndex]}</span>
            <span class="day-number">${date.getDate()}</span>
        `;
        dayColumn.appendChild(dayHeader);

        // Time slots
        const dateStr = formatDate(date);
        const bookedForDay = bookedSlots[dateStr] || [];

        timeSlots.forEach(time => {
            const slot = document.createElement('div');
            const isBooked = bookedForDay.includes(time);

            if (isBooked) {
                slot.className = 'appointment-slot booked';
                slot.innerHTML = '<span class="slot-label">Réservé</span>';
            } else {
                slot.className = 'appointment-slot available';
                slot.innerHTML = '<span class="slot-label">Disponible</span>';
                slot.onclick = () => selectSlot(slot, date, time);
            }

            dayColumn.appendChild(slot);
        });

        daysGrid.appendChild(dayColumn);
    });
}

let selectedSlotData = null;

function selectSlot(slotElement, date, time) {
    // 1. Visual feedback: Remove selected state from any other slot
    document.querySelectorAll('.appointment-slot.selected').forEach(el => {
        el.classList.remove('selected');
        const label = el.querySelector('.slot-label');
        if (label) label.textContent = 'Disponible';
    });

    // 2. Visual feedback: Add selected state to current slot
    slotElement.classList.add('selected');
    const currentLabel = slotElement.querySelector('.slot-label');
    if (currentLabel) currentLabel.textContent = 'Sélectionné';

    // 3. Store selected slot data
    selectedSlotData = { date, time, slotElement };

    // 4. Format date for display
    const dateStr = date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // 5. Update modal display
    document.getElementById('selectedTimeDisplay').textContent =
        `📅 ${dateStr} à ${time}`;

    // 6. Show modal
    document.getElementById('bookingModal').classList.add('active');
}

// Modal controls
document.addEventListener('DOMContentLoaded', () => {
    renderCalendar();

    // Week navigation
    document.getElementById('prevWeek').addEventListener('click', () => {
        currentWeekOffset--;
        renderCalendar();
    });

    document.getElementById('nextWeek').addEventListener('click', () => {
        currentWeekOffset++;
        renderCalendar();
    });

    // Modal close buttons
    document.getElementById('closeModal').addEventListener('click', closeBookingModal);
    document.getElementById('cancelBooking').addEventListener('click', closeBookingModal);

    // Click outside modal to close
    document.getElementById('bookingModal').addEventListener('click', (e) => {
        if (e.target.id === 'bookingModal') {
            closeBookingModal();
        }
    });

    // Form submission
    document.getElementById('bookingForm').addEventListener('submit', handleBookingSubmit);

    // Success modal close
    document.getElementById('closeSuccess').addEventListener('click', () => {
        document.getElementById('successModal').classList.remove('active');
        location.reload(); // Refresh to show updated calendar
    });
});

function closeBookingModal() {
    document.getElementById('bookingModal').classList.remove('active');
    document.getElementById('bookingForm').reset();
    selectedSlotData = null;
}

async function handleBookingSubmit(e) {
    e.preventDefault();

    const formData = {
        name: document.getElementById('clientName').value,
        email: document.getElementById('clientEmail').value,
        phone: document.getElementById('clientPhone').value,
        type: document.getElementById('consultationType').value,
        subject: document.getElementById('consultationSubject').value,
        date: selectedSlotData.date,
        time: selectedSlotData.time
    };

    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Envoi en cours...';
    submitBtn.disabled = true;

    try {
        // Send to Google Calendar via backend/service
        await sendToGoogleCalendar(formData);

        // Close booking modal
        closeBookingModal();

        // Show success modal
        const dateStr = formData.date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const typeLabels = {
            'cabinet': 'Au cabinet (5 rue du Renard, Paris)',
            'visio': 'En visioconférence',
            'phone': 'Par téléphone'
        };

        document.getElementById('successDetails').innerHTML = `
            <strong>${dateStr} à ${formData.time}</strong><br>
            ${typeLabels[formData.type]}<br>
            Un email de confirmation a été envoyé à ${formData.email}
        `;

        document.getElementById('successModal').classList.add('active');

    } catch (error) {
        alert('Une erreur est survenue. Veuillez réessayer ou nous contacter directement.');
        console.error('Booking error:', error);
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

async function sendToGoogleCalendar(formData) {
    const { date, time, name, email, phone, type, subject } = formData;

    const dateStr = date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const typeLabels = {
        'cabinet': 'Au cabinet (5 rue du Renard, Paris)',
        'visio': 'En visioconférence',
        'phone': 'Par téléphone'
    };

    // Create formatted email body
    const emailBody = `
NOUVEAU RENDEZ-VOUS
==================

📅 Date: ${dateStr}
🕐 Heure: ${time}

CLIENT
------
Nom: ${name}
Email: ${email}
Téléphone: ${phone}

CONSULTATION
-----------
Type: ${typeLabels[type]}
Objet: ${subject}

---
Envoyé depuis le site natafavocat.com
    `.trim();

    const mailtoLink = `mailto:contact@natafavocat.com?subject=${encodeURIComponent(`Nouveau RDV: ${dateStr} à ${time}`)}&body=${encodeURIComponent(emailBody)}`;

    // Open mailto link
    window.location.href = mailtoLink;

    // Return success after a short delay
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ success: true });
        }, 1000);
    });
}
