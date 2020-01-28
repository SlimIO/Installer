"use strict";

const { setRegistryURL } = require("../");

test("setRegistryURL default test", () => {
    expect.assertions(2);

    try {
        setRegistryURL(10);
    }
    catch (error) {
        expect(error.message).toStrictEqual("url must be an instanceof WHATWG URL");
    }

    const result = setRegistryURL(new URL("https://www.google.fr/"));
    expect(result).toStrictEqual(void 0);
});
