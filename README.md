# sing-box_template_merge_sub-store

## 关于防DNS泄露
本仓库的mihomo及sing-box1.13配置中，自带防DNS泄露功能，并且较市面主流的防泄漏方案有所优化，其运行逻辑如下：

1. cn域名列表外的所有域名，均会通过节点代理向 1.1.1.1 这类境外公共 dns 发起解析请求，不会有任何本地的dns请求记录，并且可以确保解析结果是真实无污染无劫持的。
2. 根据 1 获得的无污染 ip，匹配cn的ip列表，决定是否需要代理

也就是说，假如有一个站点xx.com，其本身不在cn的domain列表内，但他的真实ip属cn境内，那么他还是会走直连，只是dns环节经过节点代理。
而市面上流行的相当多旧方案，在这种情况下却会将xx.com无脑进行代理，这是非常不合理且效率低下的。
这也是为什么我不推荐在路由规则中使用geosite:cn或!cn这类全量的域名规则，在路由规则中，应只使用cn的ip规则进行直连or代理的判断
（事实上你甚至可以用有污染的ip进行判断，由于只要不匹配cn的ip规则，均会通过fakeip代理，所以不会有什么影响）

顺便一提，其实我本人认为“防DNS泄露”这个操作无用，只需确保gfw内的流量不由本地发起dns请求即可（无论是向境内dns服务器还是境外dns服务器，即使是境外dns服务在目前的网络环境下也会被劫持）
因此，如果使用了gfw的domain规则列表，确保这条规则在所有ip规则的上方即可避免所谓的“dns泄露风险”。

## sing-box_v1.13配置模板使用说明

提供两套配置模板及一个js脚本，js脚本使用参考旧版说明中的使用步骤

linux后缀的配置模板和win后缀唯一区别是inbounds中是否含有auto_redirect字段，这个特性不光windows，即使是安卓、iOS同样并不支持

因此诸如OpenWRT、Debian之类的linux发行版应使用linux后缀（使用auto_redirect，作为主路由或旁路网关实现透明代理），其他如安卓、iOS均应使用win后缀（不使用auto_redirect）

p.s. 使用配套脚本需要以下条件：
1. 如果使用openwrt更新脚本，需要确保使用官方ipk方式安装（需要支持/etc/init.d/sing-box指令）
2. 如果使用windows更新脚本，不能直接下载bat文件，需要手动复制其中的内容自行创建bat文件


## 以下是旧版使用说明（对应sing-box_old文件夹内的内容）

本项目所搭载的js脚本，必须在[sub-store](https://github.com/sub-store-org/Sub-Store)内使用，仅测试了项目中的singbox模板，未测试其他模板，该模板官方1.12或1.11内核一定可以使用，其余版本未测试。

适用1.12内核的：*singbox_for_win_template.json*  *singbox_for_wrt_template.json*，以及无地区分组的*for_win.json*  *for_wrt.json*

适用1.11内核的：*singbox-v11.json*

单独提供1.11的模板是因为目前iOS商店中的[【sing-box VT  APP】](https://apps.apple.com/us/app/sing-box-vt/id6673731168)使用的是1.11内核

## 使用步骤（默认模式）

1. 在sub-store上传singbox_template.json
2. 记住在sub-store中你的单条订阅或组合订阅的名称
3. 在sub-store的文件管理功能中编辑singbox_template.json 添加一个脚本操作，并且选择链接：

```
https://raw.githubusercontent.com/LongLights/sing-box_template_merge_sub-store/refs/heads/main/merge.js#name=<你在sub-store中的订阅名称>&type=<在sub-store中的订阅类型>&rules=<在sub-store中保存的自定义规则>
```

type可以赋值0或1,0表示单条订阅，1表示组合订阅，rules参数可以不指定

4. 添加脚本操作后再次访问sub-store中的singbox_template.json，就已经是把节点信息正确插入的完整可用配置了

## 无地区分组说明

无地区分组是我的自用配置，慎重选用！！！只有v1.12版本，无v1.11版本。和默认配置相比主要变化有：

1. 去掉了地区分组
2. 追加所有节点至各个策略组
3. 不支持v1.11核心，也就是不支持iOS端app store的那个sing-box vt（除非使用testflight版）
4. 另外提供了fakeip模式所需配置模板（若本地开启了ipv6则建议使用fakeip模式）
5. 另外提供了realy中继策略组（这里选择的是前置节点，配合落地节点使用，落地节点应含有detour或dailer-proxy字段，如看不懂则无视）
6. 支持指定合并js的file参数，可指定sub-store中的某一文件追加rules规则（如看不懂则无视）

### 无地区版使用步骤

参考默认模式的步骤，将模板文件和js脚本切换为[【“NoRegion”】](https://github.com/LongLights/sing-box_template_merge_sub-store/tree/main/NoRegion)文件夹内的版本即可

后续自己添加新的代理组，或者删除模板原有代理组，将继续执行全量无脑追加的策略。

## 关于链式代理及中继节点分组

如果使用本项目的无地区分组，会发现多出了一个“🔗 中继前置”策略组，并且默认选择是“🔄 直连入口”，他要配合你的“链式代理落地节点”使用。

何为链式代理落地节点：
在sing-box中，你可以在你的节点信息最后添加一行

```json
"detour": "其他节点tag或分组tag"
```

这样当你在例如“🐋 默认节点”分组中选中这条链式代理节点时，完整的访问路径就会是

 本机 -> "其他节点tag或分组tag" -> 这条链式节点（作为落地）

因此使用本项目的配置模板，你只需要指定特定节点的detour为“🔗 中继前置”，并在面板中切换“🔗 中继前置”，就可以指定不同的链式前置

（也就是说，当你通过这种方式并且定义链式节点的分流规则时（如：将netflix分流至链式节点），就仅需要在两台vps配置代理协议本身来实现sniproxy+dnsmasq的落地机分流解锁功能）

这种方式更加灵活且更加全面，可以随时将落地节点切换为直连使用，或随时通过前置节点访问原本定义分流至落地的网站

## 鸣谢

这段js脚本是由chatgpt参考[xishang0128](https://github.com/xishang0128)大佬所写

[神器sub-store](https://github.com/sub-store-org/Sub-Store)太tm好用了，强烈推荐！！！

## 注意事项

- 适用于OpenWrt的procd脚本、自动更新脚本以及适用Windows端的bat脚本，需要自行修改其中的工作目录及你自己的模板链接
- windows的bat更新脚本，直接下载不可用，需要手动复制其中的内容自己在windows创建（最好记事本编辑并且另存为ANSI编码格式）
