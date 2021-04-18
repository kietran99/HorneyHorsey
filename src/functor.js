const Some = (v) => ({
    map: (f) => Some(f(v)), 
    match: pattern => pattern.Some(v),
});

const None = () => ({
    map: (f) => None(),
    match: pattern => pattern.None(),
});