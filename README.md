# signPdf
Small website which allows pdfs to be signed in an easy and intuitive way<br />
<br />
For the UI I used React and Tyoescript.

On the backend there was a .NET Core WebApi and 2 micro services responsible for manipulating pdf files. One for extracting pictures from the pdf files (which were shown to the user on the UI) and one for applying the signature on the PDF file. The communication between the API and the micro services was done through RabbitMq message queue.

For deployment I used docker and k8s which ran on Azure. There is also a CI pipeline which automatically takes the latest tested code, creates a new docker image and then is deployed in the k8s cluster with no timeout.

For logging I used SEQ and for monitoring the app I used Prometheus and Grafana
