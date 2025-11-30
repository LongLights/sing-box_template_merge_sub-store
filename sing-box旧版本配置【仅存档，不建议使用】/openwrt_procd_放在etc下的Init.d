#!/bin/sh /etc/rc.common

USE_PROCD=1
START=99
PROG="/etc/singbox/sing-box"

start_service() {
    echo "Starting sing-box service..."
    config_load "sing-box"

    local config_file
    config_get config_file "main" "conffile" "/etc/singbox/config.json"
    config_get working_directory "main" "workdir" "/etc/singbox"

    procd_open_instance
    procd_set_param command "/etc/singbox/sing-box" run -c "$config_file" -D "$working_directory"
    procd_close_instance
}



service_triggers() {
  procd_add_reload_trigger "sing-box"
}