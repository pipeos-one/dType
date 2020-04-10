main -> type is_array {% function(d){return d; } %}
type -> number
		| bytes_like
		| boolean
		
number -> integer
		| float
		
integer -> uint
		| int
		
uint -> "uint" length 

int -> "int" length

signed -> length

float -> ufixed
		| fixed
		
ufixed -> "ufixed" length

fixed -> "fixed" length

bytes_like -> bytes
		| string
		| address
		
string -> "string"

address -> "address"

bytes -> "bytes" length

boolean -> "bool"

is_array -> simple
		| array
		
simple -> null

array -> "[" digit:* "]" is_array

length -> digit:*

digit -> [0-9]
