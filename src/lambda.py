import json
import boto3
from botocore.exceptions import ClientError

s3_client = boto3.client("s3", region_name="ca-central-1")
BUCKET_NAME = "aecid-outputfiles"


def lambda_handler(event, context):
    print("🔔 Received event:", json.dumps(event, default=str))

    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }

    if event.get("requestContext", {}).get("http", {}).get("method") == "OPTIONS":
        return {"statusCode": 200, "headers": headers, "body": ""}

    try:
        request_id = event.get("pathParameters", {}).get("request_id")
        print(f"Request ID: {request_id}")

        if not request_id:
            return {
                "statusCode": 400,
                "headers": headers,
                "body": json.dumps({"error": "Missing request_id"}),
            }

        print(f"Generating signed URLs for request_id: {request_id}")

        # List all files in the request_id folder
        try:
            response = s3_client.list_objects_v2(
                Bucket=BUCKET_NAME, Prefix=f"{request_id}/"
            )
        except ClientError as e:
            print(f"Error listing objects: {e}")
            response = {"Contents": []}

        # Generate pre-signed URLs for standard files
        urls = {
            "preview": s3_client.generate_presigned_url(
                "get_object",
                Params={"Bucket": BUCKET_NAME, "Key": f"{request_id}/result_map.png"},
                ExpiresIn=3600,
            ),
            "geojson": s3_client.generate_presigned_url(
                "get_object",
                Params={
                    "Bucket": BUCKET_NAME,
                    "Key": f"{request_id}/pareto_frontier.geojson",
                },
                ExpiresIn=3600,
            ),
            "rank": s3_client.generate_presigned_url(
                "get_object",
                Params={"Bucket": BUCKET_NAME, "Key": f"{request_id}/pareto_rank.tif"},
                ExpiresIn=3600,
            ),
            "percentiles": s3_client.generate_presigned_url(
                "get_object",
                Params={
                    "Bucket": BUCKET_NAME,
                    "Key": f"{request_id}/pareto_percentiles.tif",
                },
                ExpiresIn=3600,
            ),
            "dashboard": s3_client.generate_presigned_url(
                "get_object",
                Params={
                    "Bucket": BUCKET_NAME,
                    "Key": f"{request_id}/interactive_dashboard.html",
                },
                ExpiresIn=3600,
            ),
        }

        # Find and add pre-signed URLs for chunked files
        chunks = []
        manifest_found = False

        if "Contents" in response:
            file_list = [obj["Key"].split("/")[-1] for obj in response["Contents"]]
            print(f"📁 Files found: {file_list}")

            for obj in response["Contents"]:
                key = obj["Key"]
                filename = key.split("/")[-1]

                # Add chunks_manifest.json
                if filename == "chunks_manifest.json":
                    manifest_found = True
                    urls["chunks_manifest"] = s3_client.generate_presigned_url(
                        "get_object",
                        Params={"Bucket": BUCKET_NAME, "Key": key},
                        ExpiresIn=3600,
                    )

                # Add all chunk files (chunk_0.json, chunk_1.json, etc.)
                elif filename.startswith("chunk_") and filename.endswith(".json"):
                    chunk_url = s3_client.generate_presigned_url(
                        "get_object",
                        Params={"Bucket": BUCKET_NAME, "Key": key},
                        ExpiresIn=3600,
                    )
                    chunks.append({"filename": filename, "url": chunk_url})

        # Add chunks array if any chunks were found
        if manifest_found and chunks:
            # Sort by chunk number
            chunks.sort(
                key=lambda x: int(
                    x["filename"].replace("chunk_", "").replace(".json", "")
                )
            )
            urls["chunks"] = chunks
            urls["has_chunks"] = True
            print(f"✅ Found {len(chunks)} chunks with manifest")
        else:
            urls["has_chunks"] = False
            # Check if all_points.geojson exists
            try:
                s3_client.head_object(
                    Bucket=BUCKET_NAME, Key=f"{request_id}/all_points.geojson"
                )
                urls["all_points_geojson"] = s3_client.generate_presigned_url(
                    "get_object",
                    Params={
                        "Bucket": BUCKET_NAME,
                        "Key": f"{request_id}/all_points.geojson",
                    },
                    ExpiresIn=3600,
                )
                print("✅ Found single all_points.geojson file")
            except ClientError:
                print(
                    "⚠️  No all_points.geojson or chunks found - dashboard may not load data"
                )

        print("✅ Successfully generated signed URLs")
        print(
            f"Has chunks: {urls.get('has_chunks')}, Chunk count: {len(chunks) if chunks else 0}"
        )

        return {"statusCode": 200, "headers": headers, "body": json.dumps(urls)}

    except Exception as e:
        print("❌ Error:", str(e))
        import traceback

        print(traceback.format_exc())
        return {
            "statusCode": 500,
            "headers": headers,
            "body": json.dumps({"error": str(e)}),
        }
