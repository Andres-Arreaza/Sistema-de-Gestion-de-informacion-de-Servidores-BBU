rm -R -f ./migrations &&
pipenv run init &&
dropdb -h localhost -U postgres bbu_db || true &&
createdb -h localhost -U postgres bbu_db || true &&
psql -h localhost bbu_db -U postgres -c 'CREATE EXTENSION unaccent;' || true &&
pipenv run migrate &&
pipenv run upgrade
