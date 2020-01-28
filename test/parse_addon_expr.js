"use strict";

const { parseAddonExpr } = require("../");

test("parseAddonExpr('cpu') must return ['SlimIO', 'cpu']", () => {
    const result = parseAddonExpr("cpu");
    expect(result).toMatchObject(["SlimIO", "cpu"]);
});

test("parseAddonExpr('org/cpu') must return ['org', 'cpu']", () => {
    const result = parseAddonExpr("org/cpu");
    expect(result).toMatchObject(["org", "cpu"]);
});

test("parseAddonExpr('https://github.com/SlimIO/Socket') must return ['SlimIO', 'Socket']", () => {
    const result = parseAddonExpr("https://github.com/SlimIO/Socket");
    expect(result).toMatchObject(["SlimIO", "Socket"]);
});

test("parseAddonExpr only support github as host", () => {
    expect.assertions(1);

    try {
        parseAddonExpr("https://gitlab.com/SlimIO/Socket");
    }
    catch (error) {
        expect(error.message).toStrictEqual("Only github.com is supported as host!");
    }
});
