function main() {
    const timetable = document.getElementsByClassName("plan-lekcji")[0];
    const headers = timetable.getElementsByTagName("thead")[0].getElementsByTagName("tr")[0];
    
    const saturdayString = headers.childNodes[headers.childNodes.length-3].lastChild.textContent;
    const saturday = new Date(saturdayString).setHours(0,0,0,0);
    
    const sundayString = headers.childNodes[headers.childNodes.length-2].lastChild.textContent;
    const sunday = new Date(sundayString).setHours(0,0,0,0);

    const today = new Date().setHours(0,0,0,0);
    
    if (today == saturday || today == sunday) {
        zmienTydzien(1); // function from original librus site
    }
}
document.addEventListener("DOMContentLoaded", main);