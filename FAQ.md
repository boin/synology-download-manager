# FAQ

## How do I fix a connection failure?

There are many ways your Synology Download Manager's connection to your NAS can fail that are out of its control. Synology Download Manager does its best to guess what might be wrong and tell you (such as when it says "likely cause: wrong protocol"), but sometimes, for security reasons, browsers don't tell it enough to make a good guess.

You can reset the login session that Synology Download Manager has by using the "Test Connection and Save" button in the settings.

## What is an "invalid certificate"?

Certificates are how servers prove to browsers they are who they claim. Browsers will, by default, prevent you from accessing sites with invalid certificates unless you explicitly tell them to ignore the issue.

Synology Download Manager is subject to the same security restrictions as regular browser tabs. However, unlike a tab, it is unable to show you the page where you can override the browser's protections. To fix this issue, visit the DSM page in a browser tab using the same hostname/port you use for Synology Download Manager, which should prompt you to override the browser's protections.

## Why didn't my zip file/archive unzip/extract automatically?

DSM's "Auto Extract service" feature must be enabled by an admistrator account _and_ the account you use for Synology Download Manager (which does not have to be the same administrator account) has to enable Auto Extract for downloaded files. See the [official Synology documentation](https://www.synology.com/en-global/knowledgebase/DSM/help/DownloadStation/auto_unzip) for more details.
