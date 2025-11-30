# sing-box_template_merge_sub-store

## 关于防 DNS 泄露

本仓库的 mihomo 及 sing-box1.13 配置中，自带防 DNS 泄露功能，并且较市面主流的防泄漏方案有所优化，其运行逻辑如下：

1. cn 域名列表外的所有域名，均会通过节点代理向 1.1.1.1 这类境外公共 dns 发起解析请求，不会有任何本地的 dns 请求记录，并且可以确保解析结果是真实无污染无劫持的。
2. 根据 1 获得的无污染 ip，匹配 cn 的 ip 列表，决定是否需要代理

也就是说，假如有一个站点 xx.com，其本身不在 cn 的 domain 列表内，但他的真实 ip 属 cn 境内，那么他还是会走直连，只是 dns 环节经过节点代理。
而市面上流行的相当多旧方案，在这种情况下却会将 xx.com 无脑进行代理，这是非常不合理且效率低下的。
这也是为什么我不推荐在路由规则中使用 geosite:cn 或!cn 这类全量的域名规则，在路由规则中，应只使用 cn 的 ip 规则进行直连 or 代理的判断
（事实上你甚至可以用有污染的 ip 进行判断，由于只要不匹配 cn 的 ip 规则，均会通过 fakeip 代理，所以不会有什么影响）

## sing-box_v1.13 配置模板使用说明

提供两套配置模板及一个 js 脚本，js 脚本使用参考旧版说明中的使用步骤

两个版本间的唯一区别是 inbounds 中是否含有 auto_redirect 字段，这个特性不光 windows，即使是安卓、iOS 同样并不支持

因此诸如 OpenWRT、Debian 之类的 linux 发行版应使用无后缀版本（开启 auto_redirect，作为主路由或旁路网关实现透明代理）

其他如 Windows、安卓、iOS 均应使用有后缀的版本（不使用 auto_redirect）

注：如果你的本地网络开启了 ipv6，则使用 fakeip 模板；如果本地网络没开启 ipv6，则建议使用 realip 模板，

p.s. 使用配套脚本需要以下条件：

1. 如果使用 openwrt 更新脚本，需要确保使用官方 ipk 方式安装（需要支持/etc/init.d/sing-box 指令）
2. 如果使用 windows 更新脚本，不能直接下载 bat 文件，需要手动复制其中的内容自行创建 bat 文件（保存为 ANSI 编码）

## 使用步骤（默认模式）

1. 在 sub-store 上传 singbox_template.json
2. 记住在 sub-store 中你的单条订阅或组合订阅的名称
3. 在 sub-store 的文件管理功能中编辑 singbox_template.json 添加一个脚本操作，并且选择链接：

```
https://raw.githubusercontent.com/LongLights/sing-box_template_merge_sub-store/main/sing-box_v1.13/merge_all.js#name=<你在sub-store中的订阅名称>&type=<在sub-store中的订阅类型>
```

type 可以赋值 0 或 1,0 表示单条订阅，1 表示组合订阅

4. 添加脚本操作后再次访问 sub-store 中的 singbox_template.json，就已经是把节点信息正确插入的完整可用配置了

## 关于链式代理及中继节点分组

如果使用本项目的无地区分组，会发现多出了一个“Relay”策略组，并且默认选择是“Direct-Out”，他要配合你的“链式代理落地节点”使用。

何为链式代理落地节点：
在 sing-box 中，你可以在你的节点信息最后添加一行

```json
"detour": "其他节点tag或分组tag"
```

这样当你在例如“TikTok”分组中选中这条链式代理节点时，完整的访问路径就会是

本机 -> "其他节点 tag 或分组 tag" -> 这条链式节点（作为落地）

因此使用本项目的配置模板，你只需要指定特定节点的 detour 为“Relay”，并在面板中切换“Relay”，就可以指定不同的链式前置

（也就是说，当你通过这种方式并且定义链式节点的分流规则时（如：将 netflix 分流至链式节点），就仅需要在两台 vps 配置代理协议本身来实现 sniproxy+dnsmasq 的落地机分流解锁功能）

这种方式更加灵活且更加全面，可以随时将落地节点切换为直连使用

## 鸣谢

这段 js 脚本是由 chatgpt 参考[xishang0128](https://github.com/xishang0128)大佬所写

[神器 sub-store](https://github.com/sub-store-org/Sub-Store)太 tm 好用了，强烈推荐！！！
