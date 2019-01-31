# Fraud Friction

A Node.JS Express server and client that scores IPs based on an IP list below.

To Run Locally:

- Please install [node](https://nodejs.org/en/download/).
- Run `npm install`
- Run `npm start`
- Open `127.0.0.1:8080` to use the client.
- Use `127.0.0.1:8080/score?ip=` to access the `REST API` directly

The IP List is read from a file `ips.txt`, to change the list of IPs the server checks against, please change that file and restart the server.

The default IP List is as follows: 

|       IP        | Marking |
| :-------------: | :-----: |
|  77.52.78.176   |  login  |
|  113.28.68.110  |  fraud  |
|  108.254.5.199  |  login  |
|  83.180.223.75  |  fraud  |
|  143.236.35.94  |  login  |
|  177.27.179.81  |  fraud  |
|  68.217.131.23  |  login  |
|  130.236.74.18  |  fraud  |
| 21.203.198.168  |  login  |
| 112.95.247.246  |  fraud  |
| 130.213.238.174 |  login  |

----

### Follow Up Questions:

- *What circumstances may lead to false positives or false negatives when using solely this score?*

  ​	Mainly that distance isn’t the best indicator of this type of data. If an user moves, or travels a lot, then the distance score would be huge, and if they happen to be close to an IP that commits fraud, they could be falsely flagged. Also, any user could inherently be neighbor to an IP that’s marked as fraud, and as such always have a doubled score.

  ​	Inversely, if a malicious attempt is conducted through IP altering services, such as a VPN, which can bounce around as desired, then any score based on IP and it’s distance to a fraudulent IP is rendered meaningless.

- *What challenges are there with computing distances based on latitude/longitude?*

  ​	Mathematically, it’s pretty difficult, and the function is bit difficult to code. However geometrically, distances are generally thought of as straight lines, and the earth is anything but flat. As such distances can be skewed due to the spherical nature of earth. Not to mention these distances are coming from lat/longs from IPs, rendering them even more inaccurate.

---

### Further Considerations:

This took me a lot longer than I initially thought it would, because I kept changing mid development. Initially I was going to go with a list of IPs just in the server code, but then I had to add in reading from a file. Reading the problem even more, I noticed there could be duplicate IPs, so I had to change the IP List data structure from an array to an key - value object to avoid IP duplication. Lastly I had to switch from ipinfo to ipstack because I ran out of my daily 1000 limit… somehow.

I don’t feel like this implementation is very robust of edge cases, mainly on the file reading side of things - it’s assumed all the data in the ips.txt file is properly spaced and typed, nothing more nothing less. If there is no file, it defaults to the list that’s hardcoded.

Also, the algorithm I wrote to find the closest IP may not be the fastest. Given some way to sort or bound the IP to a smaller list (using a bounding box) was considered, but I couldn’t think of a way to implement it to make it faster. If given more time/research, I would improve that part of the algorithm the most.

In terms of the whole idea, based on my *Follow Up Questions* section, I don’t think this is a good idea at all security wise.