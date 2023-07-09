$locationToMap = pwd #pwd is get current directry
try {
    # Attempt to run the `docker info` command
    docker info > $null
  
    echo "Container is starting go to http://localhost:4000 when it is done"
    docker run -it --rm -v ${locationToMap}:"/usr/src/app" -p "4000:4000" starefossen/github-pages 
    
}
catch {

    Write-Host "Docker is not running. Please start Docker Desktop and try again."
}

