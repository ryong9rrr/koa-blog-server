<table>
    <thead>
        <tr>
            <th colspan="2" style="text-align: center">
                REST API
            </th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td style="width:50%"><b>POST</b> /posts</td>
            <td>포스트 작성</td>
        </tr>
        <tr>
            <td style="width:50%"><b>GET</b> /posts</td>
            <td>
                <div>포스트 목록 조회</div>
                <div>
                1. 뒤에 ?page=숫자 쿼리를 넣으면 pagination, 넣지 않으면 기본값으로 1이 설정됩니다.
                </div>
                <div>
                HTTP header에 "last-page"라는 key로 마지막 페이지가 제공됩니다.
                </div>
                <div>
                2. ?username 으로 해당 유저가 작성한 포스트들을 불러옵니다.
                </div>
                <div>
                3. ?tag 로 태그가 포함된 포스트들을 불러옵니다. 태그는 1개만 가능합니다.
                </div>
            </td>
        </tr>
        <tr>
            <td style="width:50%"><b>GET</b> /posts/:id</td>
            <td>특정 포스트 조회</td>
        </tr>
        <tr>
            <td style="width:50%"><b>DELETE</b> /posts/:id</td>
            <td>특정 포스트 삭제</td>
        </tr>
        <tr>
            <td style="width:50%"><b>PATCH</b> /posts/:id</td>
            <td>특정 포스트 업데이트</td>
        </tr>
        <tr>
            <td style="width:50%"><b>POST</b> /posts/:id/comments</td>
            <td>특정 포스트에 댓글 등록</td>
        </tr>
        <tr>
            <td style="width:50%"><b>GET</b> /posts/:id/comments</td>
            <td>특정 포스트의 댓글 목록 조회</td>
        </tr>
        <tr>
            <td style="width:50%"><b>DELETE</b> /posts/:id/comments/:commentId</td>
            <td>특정 포스트의 특정 댓글 삭제</td>
        </tr>
    </tbody>
</table>
