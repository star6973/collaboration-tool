# -*- coding: utf-8 -*-

# Copyright 2018 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# [START gae_python37_app]
import crawl_main
# from crawl_main import Threading
import Function1
import Function3
import Function6
import Function8

from flask import Flask, request, jsonify
import json
import threading


# If `entrypoint` is not defined in app.yaml, App Engine will look for an app
# called `app` in `main.py`.
app = Flask(__name__)


@app.route('/')
def hello():
	return 'Hello World!'

# Node.js 서버로부터 받은 JSON 객체를 DB에 저장
@app.route('/data', methods = ['POST'])
def crawledData():
	payload = request.get_json()
	# json_data = json.dumps(payload)
	
	print('--- Crawling process start ---')
	# thread = Threading(json_data)
	# result = thread.run()
	# result = crawl_main.main(json_data)
	result = crawl_main.main(payload)
	print('--- Crawling process complete ---')

	return result

# Function1. 통합 컬렉션 반환 함수
@app.route('/stop', methods = ['GET'])
def stop():
	project_name = request.args.get('project_name')
	f1 = Function1.Function1()
	f1.create_integrated_collection(project_name)
	print(project_name + ' created')
	
	return 'success'

# Function3. 파생 키워드 및 경로 반환 함수 (오브젝트 ID로 반환)
@app.route('/origin', methods = ['GET'])
def origin():
	project_name = request.args.get('project_name')
	node_id = request.args.get('node_id')
	print ('node id: ' + node_id)
	f3 = Function3.Function3(project_name)
	f3.return_origin_keyword(node_id)
	objectid_list = f3.return_result()

	node_list = []
	for node_id in objectid_list:
		node_list.append(str(node_id))

	print('ObjectId list -------')
	print(node_list)

	return jsonify(node_list=node_list)

# Function6. 추천 경로 반환 (after_data 내 해당하는 오브젝트 ID만 반환))
@app.route('/recommendation', methods = ['GET'])
def recommend():
	project_name = request.args.get('project_name')
	f6 = Function6.Function6(project_name)
	objectid_list = f6.recommend_path_node()

	node_list = []
	for node_id in objectid_list:
		node_list.append(str(node_id))

	print('Node list -------')
	print(node_list)

	return jsonify(node_list=node_list)

# Function8-1. 사용자 컬렉션 태그/메모 수정
@app.route('/tag-or-memo/user', methods = ['POST'])
def modifyUser():
	payload = request.get_json()

	project_name = payload['project_name']
	user_email = payload['user_email']
	node_id = payload['node_id']
	modified_tag = payload['modified_tag']
	modified_memo = payload['modified_memo']
	f8 = Function8.Function8()
	f8.update_user_collection(project_name, user_email, node_id, modified_tag, modified_memo)

	return 'success'

# Function8-2. 통합 컬렉션 태그/메모 수정
@app.route('/tag-or-memo/all', methods = ['POST'])
def modifyAll():
	payload = request.get_json()

	project_name = payload['project_name']
	node_id = payload['node_id']
	modified_tag = payload['modified_tag']
	modified_memo = payload['modified_memo']
	f8 = Function8.Function8()
	f8.update_all_user_collection(project_name, node_id, modified_tag, modified_memo)

	return 'success'

@app.route('/_ah/warmup')
def warmup():
    # Handle your warmup logic here, e.g. set up a database connection pool
    return '', 200, {}

if __name__ == '__main__':
	# This is used when running locally only. When deploying to Google App
	# Engine, a webserver process such as Gunicorn will serve the app. This
	# can be configured by adding an `entrypoint` to app.yaml.
	app.run(host='127.0.0.1', port=5000, debug=True)
# [END gae_python37_app]
