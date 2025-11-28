Vagrant.configure("2") do |config|
  # Use VirtualBox and an Ubuntu CLI box
  config.vm.box = "ubuntu/jammy64"
  config.vm.hostname = "ci-docker-vm"

  # Forward Jenkins web port to host (optional)
  config.vm.network "forwarded_port", guest: 8080, host: 8080

  # Sync a folder for the website repo (optional)
  config.vm.synced_folder "./site", "/home/vagrant/site", type: "virtualbox"

  # Provider-specific settings
  config.vm.provider "virtualbox" do |vb|
    vb.memory = 2048
    vb.cpus = 2
  end

  # Provision: install Docker, Docker Compose, git; run Jenkins container
  config.vm.provision "shell", inline: <<-SHELL
    set -e

    # Update and install prerequisites
    sudo apt-get update -y
    sudo apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release git

    # Install Docker
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io

    # Allow vagrant user to use docker
    sudo usermod -aG docker vagrant

    # Install docker-compose (v2 as plugin)
    sudo apt-get install -y docker-compose-plugin

    # Start Docker
    sudo systemctl enable docker
    sudo systemctl start docker

    # Pull and run Jenkins (bind Docker socket so Jenkins can run Docker)
    sudo docker pull jenkins/jenkins:lts
    sudo docker run -d --name jenkins \
      -p 8080:8080 -p 50000:50000 \
      -v /var/run/docker.sock:/var/run/docker.sock \
      -v jenkins_home:/var/jenkins_home \
      jenkins/jenkins:lts

    # Clone your website repo into synced folder if not already present
    if [ ! -d /home/vagrant/site ]; then
      git clone https://github.com/yourusername/your-website-repo.git /home/vagrant/site || true
      sudo chown -R vagrant:vagrant /home/vagrant/site
    fi

    # (Optional) start site with docker compose if repo contains docker-compose.yml
    if [ -f /home/vagrant/site/docker-compose.yml ]; then
      cd /home/vagrant/site
      sudo docker compose up -d
    fi
  SHELL
end