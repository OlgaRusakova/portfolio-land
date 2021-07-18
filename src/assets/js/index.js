(function () {
    const burger = document.querySelector(".burger");
    const menuWrap = document.querySelector(".header__menu-wrap");

    burger.addEventListener('click', function() {
    burger.classList.toggle('burger_active');
    menuWrap.classList.toggle('header__menu-wrap_visible');
    });



})();