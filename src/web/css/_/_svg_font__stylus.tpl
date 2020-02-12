@font-face
	font-family "<%= fontName %>"
	src url('../fonts/<%= fontName %>.eot<%= cacheBusterQueryString %>')
	src url('../fonts/<%= fontName %>.eot?<%= cacheBuster %>#iefix') format('eot'), url('../fonts/<%= fontName %>.woff2<%= cacheBusterQueryString %>') format('woff2'), url('../fonts/<%= fontName %>.woff<%= cacheBusterQueryString %>') format('woff'), url('../fonts/<%= fontName %>.ttf<%= cacheBusterQueryString %>') format('truetype'), url('../fonts/<%= fontName %>.svg<%= cacheBusterQueryString %>#<%= fontName %>') format('svg')

.<%= cssClass %>:before
	font-family "<%= fontName %>"
	-webkit-font-smoothing antialiased
	-moz-osx-font-smoothing grayscale
	font-style normal
	font-variant normal
	font-weight normal
	text-decoration none
	text-transform none

<% _.each(glyphs, function(glyph) { %>
.<%= cssClass %>_<%= glyph.fileName %>:before
	content "\<%= glyph.codePoint %>"
<% }); %>
