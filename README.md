# Setting Up Discord
Create server in Discord.

Create text channel for logs.

Create roles `Admins` and `Moderators`.

Invite Bot to your Server (see **Creating a Bot User** below).

Make bot a Moderator.

# Install & Dependencies
Install Node.js and Yarn.

Install forever (task scheduler).
```sh
yarn global add forever
```
Clone repository and install package dependencies.
```sh
git clone https://github.com/citra-emu/discord-bot.git
cd discord-bot
yarn
```
Create new JSON file for bot config with the following contents in the directory specified below:

**For Development:** `./config/development.json`

**For Production:** `./config/production.json`

```JSON
{
  "logChannel": "",
  "clientLoginToken": ""
} 
```
To get `logChannel`, type `\#YOUR_CHANNEL_NAME` in your Discord server chat.

Copy string of numbers **after** `#` into `"logChannel": ""`

![](http://i.imgur.com/PdcXVCD.png)

Copy App Bot User token to `"clientLoginToken": ""`

![](http://i.imgur.com/YTGZju9.png)

# Running Bot

##### For Production

First yo need to build the project by running `yarn build`.

`./start.sh` Requires a config/production.json file.

##### For Development

`yarn serve`   Requires a config/development.json file.

# License
GNU General Public License v2.0

# Creating a Bot User.
First you need to go to [discord developers](https://discordapp.com/developers/applications/me) and click "New Application"
![Application Screen](http://i.imgur.com/FvgfY2Z.png)
Now give your bot a name and a picture, a description isn't necessary.
![New Application Screen](http://i.imgur.com/MOS7yvH.png)
Click "Create Application". On the next page scroll down until you see "Create a bot user", click that. Also click yes do it.
![Screen you see after creating a new application then scrolling down a little.](http://i.imgur.com/YAzK5ml.png)
![Yes Do It.](http://i.imgur.com/vkF6Rxo.png)
Now you can get your bot's token, by using the "click to reveal button" in the app bot user section. Remember to uncheck `Public Bot`
![New Bot Page](http://i.imgur.com/xhKMUVU.png)
![Token](http://i.imgur.com/QwCmJJM.png)
There's your token! Now its time to invite your bot to your server. Don't worry about your bot being started for this next step. Change the `client_id` in the URL to your Client ID under App Details, then go to this url ```https://discordapp.com/oauth2/authorize?&client_id=YOUR_CLIENT_ID_HERE&scope=bot&permissions=0```
![Authorize Bot](http://i.imgur.com/Ggwy0BP.png)
Now select your sever, then click authorize.
![Authorized](http://i.imgur.com/4cqNcs1.png)
That's it! Now you can start your bot.
