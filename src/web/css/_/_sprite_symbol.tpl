.icon
  display inline-block
  height 1em
  width 1em
  fill inherit
  stroke inherit

  width: 100%;
  height: 100%;
  background-repeat: no-repeat !important;
  background-position: center center !important;
  background-size: 100% auto !important;

{{#shapes}}

.{{base}}_size
  @extends .icon
  font-size: {{height.inner}}px;
  width: ({{width.inner}}em / {{height.inner}});

.{{base}}
  @extends .{{base}}_size
  // font-size: {{height.inner}}px;
  // width: ({{width.inner}}em / {{height.inner}});
  background: url("{{{sprite}}}#{{base}}-view") no-repeat;

.{{base}}_b::before
  @extends .{{base}}
  content: ' ';
  display: block;

.{{base}}_mask
  @extends .icon
  @extends .{{base}}_size
  // font-size: {{height.inner}}px;
  // width: ({{width.inner}}em / {{height.inner}});
  mask: url("{{{sprite}}}#{{base}}-view") no-repeat;
  -webkit-mask: url("{{{sprite}}}#{{base}}-view") no-repeat;
  mask-size: auto;
  -webkit-mask-size: cover;
  mask-size: cover;
  background-color: #fff; // цвет по умолчанию иначе наследуется от родителя и сливается
{{/shapes}}
