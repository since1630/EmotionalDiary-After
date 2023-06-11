from pymongo import MongoClient
from flask import Flask, render_template, request, jsonify, session, redirect, url_for
import gridfs
import re
import certifi

ca = certifi.where()
client = MongoClient('', tlsCAFile = ca)
db = client.team12
application = app = Flask(__name__)
app.secret_key = 'any random string'


@app.route('/')
def home():
    if 'id' in session:
        id = session.get('id', None)
        return render_template('index.html', id=id)
    return render_template('login.html')


@app.route('/write')
def write():
    if 'id' in session:
        id = session.get('id', None)
        return render_template('write.html', id=id)
    return render_template('login.html')


@app.route('/view')
def view():
    id = session.get('id', None)
    return render_template('index.html', id=id)


@app.route('/myview')
def myview():
    if 'id' in session:
        id = session.get('id', None)
        return render_template('myview.html', id=id)
    return render_template('login.html')


@app.route('/mypage')
def mypage():
    if 'id' in session:
        id = session.get('id', None)
        return render_template('mypage.html', id=id)
    return render_template('login.html')


@app.route('/show_mypage',methods=['POST'])
def show_mypage():
    user_id = session.get('id')
    user = db.users.find_one({"id":user_id}, {'_id': False})
    # 받은 댓글 넘버로 해당하는 댓글을 끌고와서 반환
    return jsonify({'result': user})


@app.route('/update_profile', methods=['POST'])
def update_profile():
    nickname = request.form['nickname_give']
    user_id = session.get('id')
    print(nickname)
    print(user_id)
    result = db.users.update_one({'id': user_id},{'$set': {'nickname': nickname }})
    if result.modified_count > 0:
        return jsonify({'msg': "수정이 완료되었습니다.", 'success': True})
    else:
        return jsonify({'msg': "해당 사용자를 찾을 수 없습니다.", 'success': False})


@app.route('/delete_account', methods=['POST'])
def delete_account():
    user_id = session.get('id')
    result = db.users.delete_one({'id': user_id})
    print(result)
    if result.deleted_count > 0:
        return jsonify({'msg': "회원탈퇴가 완료되었습니다!"})
    else:
        return jsonify({'msg': "해당 사용자를 찾을 수 없습니다."})


@app.route('/join')
def join():
    if 'id' in session:
        id = session.get('id', None)
        return render_template('index.html', id=id)
    return render_template('join.html')


# 이메일 유효성 검사
# import re를 선언하고 사용해야함
def is_valid_email(email):
    pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    return re.match(pattern, email)


# 추가생성
@app.route('/join_done', methods=['POST'])
def join_done():
    email = request.form['email_give']
    name = request.form['name_give']
    userID = request.form['id_give']
    pwd = request.form['pwd_give']
    nickname = request.form['nick_give']

    # 모든 필드가 비어있지 않은 조건을 걸어준다(is not null)
    if email and name and userID and pwd and nickname:
        # 중복체크의 우선순의는 email -> ID -> nickname로 구성한다.
        # ex) email과 userID 둘 다 중복일 경우
        # 출력메세지: 이메일이 이미 사용 중입니다.

        # 중복체크: 이미 존재하는 email값 확인
        user_email = db.users.find_one({'email': email})
        if user_email:
            return jsonify({'msg': '이메일이 이미 사용 중입니다.'})
        # 중복체크: 이미 존재하는 id값 확인
        user_id = db.users.find_one({'id': userID})
        if user_id:
            return jsonify({'msg': '아이디가 이미 사용 중입니다.'})
        # 중복체크: 이미 존재하는 nickname값 확인
        user_nickname = db.users.find_one({'nickname': nickname})
        if user_nickname:
            return jsonify({'msg': '닉네임이 이미 사용 중입니다.'})

        # 이메일 유효성 검사
        if not is_valid_email(email):
            return jsonify({'msg': '유효한 이메일 형식이 아닙니다.'})

        # MongoDB에 데이터 저장
        doc = {
            'email': email,
            'name': name,
            'id': userID,
            'pwd': pwd,
            'nickname': nickname
        }
        db.users.insert_one(doc)
        return jsonify({'msg': '회원 가입이 완료되었습니다.'})

    else:
        return jsonify({'msg': '모든 정보를 입력하세요.'})


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        userID = request.form['loginID']
        password = request.form['loginPW']

        user = db.users.find_one({'id': userID, 'pwd': password})

        if user is not None:
            session['id'] = user['id']
            return jsonify({'msg':"로그인 성공!!"})
        else:
            return jsonify({'msg': "로그인 정보가 유효하지 않습니다."})

    return render_template('login.html')


@app.route('/logout', methods=["GET"])
def logout():
    session.pop('id', None)
    return render_template('login.html')


@app.route("/writediary", methods=['GET','POST'])
def writediary_post():
    if request.method == 'POST':
        id_receive = request.form['id_give']
        comment_receive = request.form['comment_give']
        emoji_receive = request.form['emoji_give']
        day_receive = request.form['day_give']
        month_receive = request.form['month_give']
        diarytitle_receive = request.form['title_give']
        private_receive = request.form['private_give']
        select_keywd = request.form['select_keywd']

        all_comments = list(db.diary.find({}, {'_id': False}))
        count = len(all_comments) + 1

        doc = {
            'num': count,
            'id': id_receive,
            'content':comment_receive,
            'emoji': emoji_receive,
            'day' : day_receive,
            'month' : month_receive,
            'name' : diarytitle_receive,
            'private' : private_receive,
            'select_keywd' : select_keywd
        }
        db.diary.insert_one(doc)

        return jsonify({'msg': '전송완료!'})

    all_comments = list(db.diary.find({},{'_id':False}))
    return jsonify({'result': all_comments})


@app.route("/get_keywords", methods=["GET"])
def get_keywords():
    if 'id' in session:
        id = session.get('id', None)
        keyword_data = list(db.keyword.find({}, {'_id': False}))
        return jsonify({'result': keyword_data})
    else:
        return render_template('login.html')


@app.route("/write_diary", methods=['GET', 'POST'])
def write_diary():
    if request.method == 'POST':
        id_receive = request.form['id_give']
        name_receive = request.form['name_give']
        content_receive = request.form['content_give']
        private_receive = request.form['private_give']
        emoji_receive = request.form['emoji_give']
        day_receive = request.form['day_give']
        month_receive = request.form['month_give']
  

        all_comments = list(db.diary.find({}, {'_id': False}))
        count = len(all_comments) + 1

        doc = {
            'num': count,
            'id': id_receive,
            'name': name_receive,
            'content': content_receive,
            'private': private_receive,
            'emoji': emoji_receive,
            'day' : day_receive,
            'month' : month_receive,
        }
        db.diary.insert_one(doc)

        return jsonify({'msg': '전송완료!'})
    all_comments = list(db.diary.find({'private':'false'}, {'_id': False}))
    return jsonify({'result': all_comments})


@app.route("/show_diary", methods=['GET'])
def show_diary():
    user_id = session.get('id')
    all_mycomments = list(db.diary.find({"id":user_id}, {'_id': False}))
    return jsonify({'result': all_mycomments})

# @app.route("/show_mydiary", methods=['GET'])
# def show_mydiary():
#     all_mycomments = list(db.diary.find({'id':'false'}, {'_id': False}))
#     return jsonify({'result': all_mycomments})


@app.route("/get_username", methods=['GET'])
def get_username():
    user_id = session.get('id')
    
    user = db.users.find_one({"id":user_id}, {'_id': False})
    
    return jsonify({'result': user})


@app.route("/write_comment", methods=['POST'])
def write_comment():
    comment_receive = request.form['comment_give']
    num_receive = request.form['num_give']
    wid_receive = request.form['wid_give']

    all_comments = list(db.comment.find({}, {'_id': False}))
    if len(all_comments) == 0:
        count=1
    else :
        count = all_comments[len(all_comments)-1]['id']+1
        print(count)

    doc = {
        'num': num_receive,
        'id': count,
        'wid': wid_receive,
        'comment': comment_receive,
    }
    db.comment.insert_one(doc)
    return jsonify({'msg': '전송완료!'})


@app.route("/show_comments", methods=['POST'])
def show_comments():
    num_receive = request.form['num_give']
    all_comments = list(db.comment.find({"num":num_receive}, {'_id': False}))
    # 받은 게시판 넘버로 해당하는 모든 댓글을 끌고와서 반환
    return jsonify({'result': all_comments})


@app.route("/show_comment", methods=['POST'])
def show_comment():
    id_receive = request.form['id_give']
    comment = db.comment.find_one({"id":int(id_receive)}, {'_id': False})
    print(comment)
    # 받은 댓글 넘버로 해당하는 댓글을 끌고와서 반환
    return jsonify({'result': comment})


@app.route("/update_comment", methods=['POST'])
def update_comment():
    id_receive = request.form['id_give']
    comment_receive = request.form['comment_give']
    print(id_receive)
    print(comment_receive)
    db.comment.update_one({'id': int(id_receive)}, {'$set':{'comment': comment_receive}})
    # 받은 댓글 넘버로 해당하는 댓글을 끌고와서 반환
    return jsonify({'msg': '수정완료'})


@app.route("/delete_comment", methods=['POST'])
def delete_comment():
    id_receive = request.form['id_give']

    db.comment.delete_one({'id':int(id_receive)})

    return jsonify({'msg': '삭제완료!'})


if __name__ == '__main__':
    app.run('0.0.0.0', port=5001,debug=True)
