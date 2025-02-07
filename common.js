window.addEventListener('load', () => {

    let lang = localStorage.getItem("lang");
    if (lang !== null) {
        changeLang(lang);
    }
})

function changeLang(lang) {
    window.i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
}