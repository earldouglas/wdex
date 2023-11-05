let

  region = "us-east-2";
  accessKeyId = "wdex";

in {

  network.description = "Wikidata Explorer";

  resources.ec2KeyPairs.wdex-key-pair = {
    inherit region accessKeyId;
    name = "wdex";
  };

  resources.elasticIPs.wdex-elastic-ip = {
    inherit region accessKeyId;
    vpc = true;
    name = "wdex";
  };

  wdex =
    { resources, pkgs, ... }:
    let
      src = ../src;
    in
    {

      nixpkgs.system = "aarch64-linux";

      # EC2 ############################################################
      deployment = {
	targetEnv = "ec2";
	ec2 = {
	  accessKeyId = accessKeyId;
	  region = region;
	  instanceType = "t4g.nano";
	  keyPair = resources.ec2KeyPairs.wdex-key-pair;
	  ami = "ami-033ff64078c59f378";
	  ebsInitialRootDiskSize = 12;
          elasticIPv4 = resources.elasticIPs.wdex-elastic-ip;
	};
      };

      # Time Zone ######################################################
      time.timeZone = "America/Phoenix";

      # GC #############################################################
      nix.gc.automatic = true;
      nix.gc.options = "-d";
      nix.optimise.automatic = true;

      # Disable docs ###################################################
      documentation.enable = false;
      documentation.dev.enable = false;
      documentation.doc.enable = false;
      documentation.info.enable = false;
      documentation.man.enable = false;
      documentation.nixos.enable = false;

      # Security #######################################################
      services.fail2ban.enable = true;
      networking.firewall.allowedTCPPorts = [
        22 # ssh
        80 # http
        443 # https
      ];

      # nginx ##########################################################
      security.acme.defaults.email = "james@earldouglas.com";
      security.acme.acceptTerms = true;

      services.nginx = {
	enable = true;
	recommendedGzipSettings = true;
	commonHttpConfig = ''
	  charset utf-8;
	  log_format postdata '$time_local\t$remote_addr\t$request_body';
	  limit_req_zone $binary_remote_addr zone=ip:10m rate=5r/s;
	  add_header Permissions-Policy "interest-cohort=()";
	  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
	'';
	virtualHosts = {
	  "wdex.earldouglas.com" = {
	    enableACME = true;
	    onlySSL = false; # preferred for securitah
	    forceSSL = true; # needed for acme?
	    locations = {
	      "/proxies/wdq".extraConfig = ''
		rewrite /proxies/wdq/(.*) /bigdata/namespace/wdq/$1 break;
		proxy_set_header Host query.wikidata.org;
		proxy_pass https://query.wikidata.org:443;
	      '';
	      "/proxies/wd".extraConfig = ''
		rewrite /proxies/wd/(.*) /w/$1 break;
		proxy_set_header Host www.wikidata.org;
		proxy_pass https://www.wikidata.org:443;
	      '';
	      "/".root = "${src}";
	    };
	  };
	};
      };

    };
}
