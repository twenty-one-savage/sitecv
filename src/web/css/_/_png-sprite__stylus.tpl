$i
  display inline-block
  background-repeat no-repeat
  -webkit-background-size auto
  -o-background-size auto
  background-size auto

.i-img
  @extends $i

{{#sprites}}

$name = '.i-img_{{{stringCleaner name}}}'
$name_pseudo = '{{{parseName name 'pseudo'}}}'
$name_id = '.i-img_{{{parseName name 'id'}}}'
$name_full = '.i-img_{{{parseName name 'full'}}}'


if $name_pseudo
  {$name_full}
    background-image url(../images/png-sprite.png)
    background-position {{px.offset_x}} {{px.offset_y}}

else
  {$name_full}
    @extends $i
    background-image url(../images/png-sprite.png)
    background-position {{px.offset_x}} {{px.offset_y}}
    width {{px.width}}
    height {{px.height}}

{{/sprites}}
