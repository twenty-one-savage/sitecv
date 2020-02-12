<!DOCTYPE html>
<!--[if lt IE 7]><html class="ie6"><![endif]-->
<!--[if IE 7]><html class="ie7"><![endif]-->
<!--[if IE 8]><html class="ie8"><![endif]-->
<!--[if IE 9 ]><html class="ie9"><![endif]-->
<!--[if !IE]><!-->
<html lang="ru">
<!--<![endif]-->

<head>
  <title>Халил Мечеть</title>
  <meta name="description" content="" />
  <!--[if IE]>
	<script src="//html5shiv.googlecode.com/svn/trunk/html5.js"></script>
	<![endif]-->
  {*
  <base href="{$_modx->config.site_url}" /> *}
  <base href="/" />
  <meta charset="utf-8" />
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />

  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="viewport"
    content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no">

  <!-- Favicons -->
  <link rel="apple-touch-icon-precomposed" sizes="144x144" href="{{$_my.templateUrlBase}}images/base/favicon.ico">
  <link rel="shortcut icon" href="{{$_my.templateUrlBase}}images/base/favicon.ico" />
  <link rel="shortcut icon" href="{{$_my.templateUrlBase}}images/base/favicon.ico" />
  <link rel="stylesheet" href="{{$_my.templateUrlBase}}css/vendors.css?ver=1">
  <link rel="stylesheet" href="{{$_my.templateUrlBase}}css/all.css?ver=1">
  <link rel="stylesheet" href="{{$_my.templateUrlBase}}css/style.css?ver=1">
</head>

{* {if $_modx->hasSessionContext('mgr') && 1==1}
{include "path:web/others/system_info.tpl"}
{/if} *}

<body id="top"
  class="{%block body_class%}{% endblock %} {{$"mode_development" if _modx.config.site_dev_mode else "mode_production"}}">
  <div class="fill fill_image-green">
    {{$include( "_/sections/header.tpl") }}
  </div>



    <div class="fill fill_image fill_image-green_with-image section-padding pb-0">
      <div class="container">
        <div class="row">
          <div class="col-12">
            {{$include( "_/components/intro/index.tpl") }}
          </div>
        </div>
      </div>
    </div>
    <div class="container section-padding">
      <div class="row">
        <div class="col-12">
          {{$include( "_/components/about/index.tpl") }}
        </div>
      </div>
    </div>
    <div class="fill fill_gray-light section-padding">
      <div class="container section-padding">
        <div class="row">
          <div class="col-12">
            {{$include( "_/components/docs/index.tpl") }}
          </div>
        </div>
      </div>
    </div>
    <div class="container section-padding">
      <div class="row">
        <div class="col-12">
          {{$include( "_/components/requisites/index.tpl") }}
        </div>
      </div>
    </div>
    <div class="fill fill_gray-light section-padding">
      <div class="container section-padding">
        <div class="row">
          <div class="col-12">
            {{$include( "_/components/building/index.tpl") }}
          </div>
        </div>
      </div>
    </div>
    <div class="container section-padding">
      <div class="row">
        <div class="col-12">
          {{$include( "_/components/feedback/index.tpl") }}
        </div>
      </div>
    </div>
    <div class="container section-padding">
      <div class="row">
        <div class="col-12">
          {{$include( "_/components/contacts/index.tpl") }}
        </div>
      </div>
    </div>
  {% block before_footer %}{% endblock %}
    {{$include( "_/sections/footer.tpl") }}

  {% block additional %}
  <!-- {* сюда складируем вывод доп. стилей, скриптов и html *} -->
  {% endblock %}
  <script src="{{$_my.templateUrlBase}}js/vendors.js?ver=1"></script>
  <script src="{{$_my.templateUrlBase}}js/scripts.js?ver=1.01"></script>

</body>

</html>