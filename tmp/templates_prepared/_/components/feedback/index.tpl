<!-- _/components/feedback/index.tpl -->
<div class="border border_primary py-5 rounded">
  <div class="row">
    <div class="col-10 offset-1 col-xl-8 offset-xl-2">
  <section class="feedback" id="feedback">
    <h2 class="feedback__title title-section title-section_lines">Задать вопрос</h2>
    <h3 class="feedback__subtitle mb-3">Если у Вас возникли вопросы по проекту, задайте их нам. Вы получите ответ в
      течение 3
      рабочих дней.</h3>
        <form class="feedback__form mt-5" action="">
          <div class="row">
            <div class="col-12 col-md-6 mb-2 mb-lg-0">
              <input class="feedback__input" type="text" name="name" placeholder="Имя" required>
            </div>
            <div class="col-12 col-md-6">
              <input class="feedback__input" type="email" name="email" placeholder="E-mail" required>
            </div>
            <div class="col-12">
              <textarea class="feedback__textarea" rows="5" name="message" id="" placeholder="Ваш вопрос"></textarea>
            </div>
          </div>
          <div class="row align-items-center mt-4">
            <div class="col-12 col-lg-6 custom-control custom-control-lg custom-checkbox ml-3
        ">
              <input type="checkbox" class="custom-control-input" id="customCheck" name="example1">
              <label class="custom-control-label d-flex align-items-center" for="customCheck">Даю согласие на обработку
                персональных данных</label>
            </div>
            <div class="col-12 col-lg d-flex justify-content-center justify-content-lg-end mt-4 mt-lg-0">
              <button class="feedback__button btn btn-primary" type="submit">Отправить</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </section>
</div>
<!-- /// _/components/feedback/index.tpl -->
