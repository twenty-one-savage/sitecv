jQuery(document).ready(function ($) {

  if ($('#map').length > 0) {
    $(document).on('click mousedown', '.contacts__after', function(event) {
      if ($(window).width() < 768) {
        $('.js-contacts-block').css("top",280);
        $('.js-contacts').css("padding-bottom",280);
        $('.contacts__after').hide();
      }
    });
  }

  addEventToMoreButton();
  addEventToMoreButton2();

  /* скролл до блока в href при клике на ссылку*/
  $(document).on('click', '.scrollToBlock', function () {
    $("html, body").animate({
      scrollTop: ($($(this).attr('href')).offset().top - ($(window).height() / 3))
    }, "slow");
    return false;
  });

  $(document).on('click', '.js-modal', function (event) {
    var $this = $(this);
    if ($this.data('modal')) {
      $.fancybox.open($($this.data('modal')));
    }
    return false;
  });
});


function addEventToMoreButton() {
  var moreButtons = document.querySelectorAll('.js-stash-btn');
  if (moreButtons) {
    moreButtons.forEach(function (el) {
      el.addEventListener('click', function() {
        showBlocks(el);
      });
    })

    function showBlocks(el) {
      var firstElement = document.querySelector('.js-hidden-block');
      var secondElement = document.querySelector('.js-stash');
      firstElement.classList.remove('d-none')
      secondElement.classList.remove('stash-md');
      el.classList.add('d-none');
    }
  }
}
// Костыль
function addEventToMoreButton2() {
  var moreButton = document.querySelector('.js-stash-btn-2');
  if (moreButton) {
    moreButton.addEventListener('click',showBlock);
  }

    function showBlock() {
      var secondElement = document.querySelector('.js-stash-2');
      secondElement.classList.remove('stash-md');
      moreButton.classList.add('d-none');
    }
}