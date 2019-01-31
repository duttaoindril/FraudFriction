*git bundle create my_repo.bundle --all* |Submit to our [upload portal](https://goo.gl/forms/5hIzgEmfJHLckJ182). 

**Fraud Friction**

Let's pretend you are on a software engineering team that's working on a fraud prevention pipeline. The pipeline uses a number of factors and advanced machine learning to determine whether a login attempt is fraudulent. 

For one step in the pipeline, your team wants to use IP information to score the likelihood of a login being fraudulent. 

Assume you have a file with the user's past record of login attempts: 

   FRAUD 8.8.8.8 

   LOGIN 22.4.62.188 

   ... 

This file is a list of IP addresses from which a login was attempted.  **The list may contain hundreds or thousands of entries with some IP addresses appearing many times if the user frequently logs in from the same place.**  FRAUD means that this IP was used for a known fraudulent login attempt, and LOGIN means this login attempt was not known to be fraudulent.   

Given this file, score a new login attempt using the following criteria: 

- Let the "distance" between two IP addresses be the physical distance between the IP’s latitude/longitude coordinates. You can use [IPinfo.io](https://ipinfo.io/) for latitude/longitude location information, and you may use the latitude/longitude distance formula of your choice. 
- The score will be the mile distance between the new login IP and the closest IP found in the input list. 
- If the closest previous IP was marked as FRAUD, you should double the score before returning your final answer. 

**Follow Up Questions**

- What circumstances may lead to false positives or false negatives when using solely this score? 
- What challenges are there with computing distances based on latitude/longitude? 

You can use any libraries you wish. Please include instructions on how-to build your project in the README.md file in the root of your repository.  Also include a section called **Further Considerations** in which you describe issues you had while working on this challenge, as well ideas to make this better in the future.

----

