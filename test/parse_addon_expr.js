"use strict";

const { parseAddonExpr } = require("../");

test("parseAddonExpr('cpu') must return ['SlimIO', 'cpu']", () => {
    const result = parseAddonExpr("cpu");
    expect(result).toMatchObject({
        repoUserOrg: "SlimIO",
        repoName: "cpu",
        host: null
    });
});

test("parseAddonExpr('org/cpu') must return ['org', 'cpu']", () => {
    const result = parseAddonExpr("org/cpu");
    expect(result).toMatchObject({
        repoUserOrg: "org",
        repoName: "cpu",
        host: null
    });
});

test("parseAddonExpr('org.cpu') must return ['org', 'cpu']", () => {
    const result = parseAddonExpr("org.cpu");
    expect(result).toMatchObject({
        repoUserOrg: "org",
        repoName: "cpu",
        host: null
    });
});

test("parseAddonExpr('https://github.com/SlimIO/Socket') must return ['SlimIO', 'Socket']", () => {
    const result = parseAddonExpr("https://github.com/SlimIO/Socket");
    expect(result).toMatchObject({
        repoUserOrg: "SlimIO",
        repoName: "Socket",
        host: "github.com"
    });
});

test("parseAddonExpr only support github as host", () => {
    expect.assertions(1);

    try {
        parseAddonExpr("https://kh1.com/SlimIO/Socket");
    }
    catch (error) {
        expect(error.message).toStrictEqual("Unsupported host 'kh1.com'");
    }
});
