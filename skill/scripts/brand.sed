# DesignerX brand layer for engine output (BSD/GNU sed -E).
# Protocol tokens (.impeccable/ state dir, data-impeccable-*, IMPECCABLE_*, URLs)
# are untouched: only the capitalised brand word and slash/dollar command forms change.
s/Impeccable/DesignerX/g
s#(^|[ `"'(\[])/impeccable([] `"'):,.]|$)#\1/designerx\2#g
s#(^|[ `"'(\[])\$impeccable([] `"'):,.]|$)#\1$designerx\2#g
s#npx impeccable#npx designerx#g
