async function main() {
    let schowajZachowanie;
    await chrome.storage.local.get(["schowajZachowanie"]).then((result) => {schowajZachowanie = result.schowajZachowanie ?? true});
    if (schowajZachowanie) document.getElementById("przedmioty_zachowanie_node").click();
};

main();