### On production server

#### As **root**

- Ensure rsync is installed on the production server
- `sudo visudo` and add this line

  ```bash
  # backup group can do anything

  %backupuser ALL=(ALL) NOPASSWD: /usr/bin/rsync
  ```

- Create a backupuser on the production server

  ```shell
  sudo adduser backupuser
  sudo apt install whois
  mkpasswd --method=sha-512
  sudo usermod -p '<password>' backupuser
  ```

- Create the same user in postgres

  ```shell
  su postgres
  psql
  ```

  ```
  create user backupuser superuser password '<password>';
  alter user backupuser set default_transaction_read_only = on;
  ```

#### As **backupuser**

- Confirm that the backup user can run `pg_dump`

- add a `rsync-wrapper.sh` at `~`

  ```bash
  #!/bin/sh

  logger -t backup $@
  pg_dump bus > potato/bus.sql
  /usr/bin/sudo /usr/bin/rsync "$@"
  ```

  Set permission

  ```shell
  chmod ug+x /home/backup/rsync-wrapper.sh
  ```

### On backup server

#### As **root**

- Create a backupuser on the backup server

  ```shell
  sudo adduser backupuser
  sudo apt install whois
  mkpasswd --method=sha-512
  sudo usermod -p '<password>' backupuser
  ```

- Install rsnaptshot
  ```shell
  sudo apt install rsnapshot
  ```
- Config rsnapshot with `example_rsnapshot.conf`
- Make a backup directory

  ```shell
  mkdir -p /mnt/backup
  chown backupuser:backupuser /mnt/backup
  chmod 770 /mnt/backup
  ```

#### As **backupuser**

- ssh-key
  ```shell
  ssh-keygen -t ed25519
  ssh-copy-id backupuser@potato.colab.duke.edu
  ```
  Confirm with
  ```shell
  ssh backupuser@potato.colab.duke.edu
  ```
- Add mailing script at `~/run_rsnapshot.sh`

  ```bash
  OUTPUT=`rsnapshot $@`
  if [ $? -ne 0 ]
  then
      printf "Here's your backup log: ${OUTPUT}" | /usr/bin/mail -s "[Potato] Beta Server Backup Failed" zz160@duke.edu
  else
      printf "Here's your backup log: ${OUTPUT}" | /usr/bin/mail -s "[Potato] Beta Server Backup Succeeded" zz160@duke.edu
  fi
  ```

- Configure crontab `crotab -e`

  ```
  0 4 * * * /home/backupuser/run_rsnapshot.sh daily
  0 4 * * 1 /home/backupuser/run_rsnapshot.sh weekly
  0 4 1 * * /home/backupuser/run_rsnapshot.sh monthly
  ```
