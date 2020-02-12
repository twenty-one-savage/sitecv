use("{{{src_template_path}}}plugins/parse_name.js")

$i
  display inline-block
  height 1em
  width 1em
  fill inherit
  stroke inherit
  background-repeat: no-repeat !important;
  background-position: center center !important;
  background-size: 100% auto !important;

.i-svg
  @extends $i

{{!-- $s_name + '_size' --}}
{{#shapes}}

$name = '.i-svg_{{name}}'
$name_pseudo = parse_name($name, 'pseudo')
$name_id = parse_name($name, 'id')
$name_full = parse_name($name, 'full')

if $name_pseudo
  {$name_full}
    background-image: url("{{{sprite}}}#{{name}}-view");
  {$name_id+'_mask'}:{$name_pseudo}
    mask: url("{{{sprite}}}#{{name}}-view") no-repeat;
    -webkit-mask: url("{{{sprite}}}#{{name}}-view") no-repeat;
else
  $common
    @extends $i
    background-image: url("{{{sprite}}}#{{name}}-view");

  {$name_id}
    @extends $common

    &_b::before
      @extends $common
      content: ' ';
      display: block;

      ~/_mask
        @extends $common
        mask-image: url("{{{sprite}}}#{{name}}-view");
        -webkit-mask-image: url("{{{sprite}}}#{{name}}-view");
        mask-size: 100% auto !important;
        -webkit-mask-size: 100% auto !important;
        mask-repeat: no-repeat;
        -webkit-mask-repeat: no-repeat;
        mask-position: center center !important;
        -webkit-mask-position: center center !important;
        background: black; // цвет по умолчанию иначе наследуется от родителя и сливается

{{/shapes}}
