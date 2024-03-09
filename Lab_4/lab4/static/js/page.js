function addContact() {
    const name = document.getElementsByName('name')[0].value;
    const phone = document.getElementsByName('phone')[0].value;

    fetch('/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone })
    }).then(response => {
        response.json().then(() => {
            window.location.href = '/';
        });
    });
}



async function editContact() {
    const id = document.querySelector('.form').getAttribute('data-key');
    const name = document.querySelector('input[name="name"]').value;
    const phone = document.querySelector('input[name="phone"]').value;

    try {
        await fetch(`/update?id=${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, phone })
        });
        window.location.href = '/';
    } catch (error) {
        console.log(error);
    }
}



async function deleteContact() {
    const id = document.querySelector('.form').getAttribute('data-key');

    try {
        await fetch(`/delete?id=${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        window.location.href = '/';
    } catch (error) {
        console.log(error);
    }
}

function blockButton(name, phone) {
    const button = document.getElementById('delete-button');

    if (document.getElementsByName('name').value !== name || document.getElementsByName('phone').value !== phone) {
        button.setAttribute('disabled', 'true');
    } else {
        button.setAttribute('disabled', 'false');
    }
}