#!/bin/bash

#
# Adds the alias definition for npm to the shell configuration file
#

#
# Users need to adjust the shell configuration file path if it is different
shell_config_file=~/.zshrc
shell_config_file_backup=~/.bashrc
if [ ! -f $shell_config_file ]; then
    shell_config_file=$shell_config_file_backup
fi

#
# Creates the alias
echo '' >> $shell_config_file
echo '#' >> $shell_config_file
echo '# Add the alias definition for npm' >> $shell_config_file
echo 'alias npm="npm_with_safe_install"' >> $shell_config_file
echo '' >> $shell_config_file

#
# Define the npm alias with safe installation
echo '' >> $shell_config_file
echo '#' >> $shell_config_file
echo '# Define the npm alias with safe installation' >> $shell_config_file
echo 'npm_with_safe_install() {' >> $shell_config_file
echo '    if [[ $1 == "install" || $1 == "i" ]]; then' >> $shell_config_file
echo '        if [ $# -eq 1 ]; then' >> $shell_config_file
echo '            command npm install' >> $shell_config_file
echo '        else' >> $shell_config_file
echo '            shift' >> $shell_config_file
echo '            npi "$@"' >> $shell_config_file
echo '        fi' >> $shell_config_file
echo '    elif [[ $1 == "oldinstall" ]]; then' >> $shell_config_file
echo '        if [ $# -eq 1 ]; then' >> $shell_config_file
echo '            command npm install' >> $shell_config_file
echo '        else' >> $shell_config_file
echo '            shift' >> $shell_config_file
echo '            command npm install "$@"' >> $shell_config_file
echo '        fi' >> $shell_config_file
echo '    else' >> $shell_config_file
echo '        command npm "$@"' >> $shell_config_file
echo '    fi' >> $shell_config_file
echo '}' >> $shell_config_file

#
# Reload the shell configuration
source $shell_config_file

echo 'Alias setup complete. You can now use "npm install" or "npm i" as "npi".'