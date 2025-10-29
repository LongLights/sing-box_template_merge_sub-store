const { name, type } = $arguments;

// 1. 加载模板
let config = JSON.parse($files[0]);

// 2. 拉取订阅或合集节点
let proxies = await produceArtifact({
  name,
  type: /^1$|col/i.test(type) ? "collection" : "subscription",
  platform: "sing-box",
  produceType: "internal",
});

// 3. 去重：过滤掉 tag 冲突的节点
const existingTags = config.outbounds.map((o) => o.tag);
proxies = proxies.filter((p) => !existingTags.includes(p.tag));

// 4. 添加到 outbounds
config.outbounds.push(...proxies);

// 5. 获取新节点 tag 列表
const allTags = proxies.map((p) => p.tag);

// 6. 区域匹配规则（可随时扩展）
const regions = {
  "🇭🇰 香港节点": /香港|HK|Hong\s?Kong/i,
  "🇹🇼 台湾节点": /台湾|台|Tai\s?Wan|TW|TWN/i,
  "🇯🇵 日本节点": /日本|JP|JPN|Japan|Tokyo/i,
  "🇺🇸 美国节点": /美国|US|USA|United\s?States|America/i,
  "🇸🇬 新加坡节点": /新加坡|SG|SIN|Singapore/i,
};

// 7. 需要追加节点的 7 个代理分组
const otherGroups = ["⚙️ 手动切换", "🎚️ 自动选择"];
const regionGroups = Object.keys(regions);
const targetGroups = [...otherGroups, ...regionGroups];

targetGroups.forEach((groupTag) => {
  const group = config.outbounds.find((o) => o.tag === groupTag && Array.isArray(o.outbounds));
  if (!group) return;

  // 匹配所有符合条件的新节点
  const matched = otherGroups.includes(groupTag)
    ? allTags // 手动/自动 取全部
    : allTags.filter((tag) => regions[groupTag].test(tag)); // 地区组按正则匹配

  // 如果有匹配到节点，就用匹配结果；否则回退到 direct-tag
  group.outbounds = matched.length > 0 ? matched : ["🔄 直连入口"];
});

// 8. 输出最终配置
$content = JSON.stringify(config, null, 2);
