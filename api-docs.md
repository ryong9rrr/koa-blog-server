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
            <td>포스트 목록 조회</td>
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
