run:
	deno run --allow-read --allow-write main.ts --source template.json --output settings.json

wsl-install:
	cp -f settings.json /mnt/c/Users/gnzh/AppData/Roaming/Code/User/settings.json
