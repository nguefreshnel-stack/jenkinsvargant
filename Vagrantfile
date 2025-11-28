Vagrant.configure("2") do |config|
  # Use VirtualBox and an Ubuntu CLI box
  config.vm.box = "ubuntu/jammy64"
  config.vm.hostname = "ci-docker-vm"

  # Forward Jenkins web port to host (optional)
  config.vm.network "forwarded_port", guest: 8090, host: 8090

  # Sync the project folder into the VM (use the repo root)
  config.vm.synced_folder ".", "/vagrant", type: "virtualbox"

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

    # Ensure a .ssh dir exists in the Jenkins home volume and set ownership
    sudo mkdir -p /var/jenkins_home/.ssh || true
    sudo chown -R 1000:1000 /var/jenkins_home || true

    # Quick fix: mount the Vagrant private_key into the Jenkins container so
    # Jenkins can read it at /var/jenkins_home/.ssh/private_key. This makes the
    # key available inside the container; for production use Jenkins Credentials
    # (recommended) instead of mounting host keys.
    if [ -f /vagrant/.vagrant/machines/default/virtualbox/private_key ]; then
      KEY_MOUNT="-v /vagrant/.vagrant/machines/default/virtualbox/private_key:/var/jenkins_home/.ssh/private_key:ro"
    else
      KEY_MOUNT=""
    fi

    sudo docker run -d --name jenkins \
      -p 8080:8080 -p 50000:50000 \
      -v /var/run/docker.sock:/var/run/docker.sock \
      -v jenkins_home:/var/jenkins_home \
      $KEY_MOUNT \
      jenkins/jenkins:lts

    # If the synced folder is empty on the host, optionally clone a website repo into /vagrant.
    # If you already have your website files in the host repo, they will be available at /vagrant.
    if [ -z "$(ls -A /vagrant)" ]; then
      git clone https://github.com/nguefreshnel-stack/jenkinsvargant.git /vagrant || true
      sudo chown -R vagrant:vagrant /vagrant
    fi

    # (Optional) start site with docker compose if repo contains docker-compose.yml
    if [ -f /vagrant/docker-compose.yml ]; then
      cd /vagrant
      sudo docker compose up -d
    fi
  SHELL
end