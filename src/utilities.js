export const loadProfile = () => {
    if (localStorage.getItem('usr_pr') && localStorage.getItem('usr_tk')) {
        try {
            return {
                usr_obj: JSON.parse(localStorage.getItem('usr_pr')),
                usr_tk: localStorage.getItem('usr_tk'),
                is_remember: true
            }
        } catch (error) {
            return {
                usr_obj: null,
                usr_tk: null,
                is_remember: true
            }
        }
    } else if (sessionStorage.getItem('usr_pr')) {
        try {
            return {
                usr_obj: JSON.parse(sessionStorage.getItem('usr_pr')),
                usr_tk: sessionStorage.getItem('usr_tk'),
                is_remember: false
            }
        } catch (error) {
            return {
                usr_obj: null,
                usr_tk: null,
                is_remember: false
            }
        }
    }
    return {
        usr_obj: null,
        usr_tk: null,
        is_remember: true
    }
}

export const clearToken = () => {
    localStorage.removeItem('usr_pr')
    localStorage.removeItem('usr_tk')
    sessionStorage.removeItem('usr_pr')
    sessionStorage.removeItem('usr_tk')
}

export const obscureEmail = (email) => {
    const [name, domain] = email.split('@');
    return `${name[0]}${new Array(name.length).join('*')}@${domain}`;
};

export const formatPhone = (phone) => {
    const strPhone = phone.toString()
    if (strPhone.length < 8) {
        return phone
    }
    return [strPhone.slice(0, 3), strPhone.slice(3,7), strPhone.slice(7)].join(' ');
}

export const downloadFile = (content, filename) => {
    let a = document.createElement('a');
    a.href = window.URL.createObjectURL(content);
    a.download = filename;
    a.click();
}