const { name, type } = $arguments;
let s = $files[0];

// 1. 拉取订阅节点列表并去掉无用字段
let p = await produceArtifact({
  name,
  type: /^1$|col/i.test(type) ? "collection" : "subscription",
  platform: "ClashMeta",
  produceType: "internal"
});
p = p.map(x => {
  delete x._subName;
  delete x._subDisplayName;
  return x;
});

// 2. 输出为单行 JSON 到 proxies 段
let e = p.map(x => `  - ${JSON.stringify(x)}`).join("\n");
s = s.replace(/(?=^proxy-groups:)/m, `proxies:\n${e}\n\n`);

// 3. 追加分组成员名，并只排除含有dialer-proxy的节点进“中继前置”组
let all = p.map(x => x.name);
let r = p.filter(x => !x["dialer-proxy"]).map(x => x.name);

s = s.replace(
  /^(\s{2}- name:[\s\S]*?)\s{4}proxies:\s*\[([^\]]*)\]/gm,
  (m, head, body) => {
    let ex = body.split(",").map(x => x.trim()).filter(Boolean);
    // 精确提取分组名
    let groupMatch = head.match(/- name:\s*([^\n]+)/);
    let groupName = groupMatch ? groupMatch[1].trim() : "";
    let add = (groupName === "Relay") ? r : all;
    let merged = [...new Set([...ex, ...add])];
    return `${head}    proxies: [${merged.join(", ")}]`;
  }
);

$content = s;